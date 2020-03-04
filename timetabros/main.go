package main

import (
    "context"
    "log"
    "encoding/json"
    "encoding/gob"
    "time"

    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"

    "net/http"

    //"github.com/gin-gonic/contrib/static"
    "github.com/gin-gonic/gin"
    "github.com/gorilla/sessions"
    "github.com/gorilla/securecookie"

    "golang.org/x/crypto/bcrypt"
)

type User struct {
    Username string `json:"username" binding:"required"`
    Firstname string `json:"firstname" binding:"required"`
    Lastname string `json:"lastname" binding:"required"`
    Email string `json:"email" binding:"required"`
    Password string `json:"password" binding:"required"`
    Verified int
}

type PendingUser struct {
    Userid primitive.ObjectID
}

type LoginCredentials struct {
    Username string `json:"username"`
    Password string `json:"password"`
    Email string `json:"email"`
}

type EventItem struct {
    Createdby *primitive.ObjectID `json:"createdby"`
    Startdate string `json:"startdate" binding:"required"`
    Enddate string `json:"enddate" binding:"required"`
    Title string `json:"title" binding:"required"`
    Description string `json:"description"`
    Expirydate string `json:"expirydate"`
    EventMembers []EventMember `json:"eventmembers"`
}

type EventItemDB struct {
    Createdby *primitive.ObjectID `json:"createdby" binding:"required"`
    Startdate time.Time `json:"startdate" binding:"required"`
    Enddate time.Time `json:"enddate" binding:"required"`
    Title string `json:"title" binding:"required"`
    Description string `json:"description"`
    Expirydate time.Time `json:"expirydate"`
    EventMembers []EventMember `json:"eventmembers"`
}

type EventMember struct {
    Userid primitive.ObjectID
    Status string `json:"status" binding:"required"`
}

const layout = "2006-01-02T15:04:05.000Z"

var users *mongo.Collection
var pendingUsers *mongo.Collection
var eventItems *mongo.Collection
var store *sessions.CookieStore

func main() {
    // connect to mongodb
    clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")
    client, err := mongo.Connect(context.TODO(), clientOptions)
    if err != nil {
        log.Fatal(err)
    }
    err = client.Ping(context.TODO(), nil)
    if err != nil {
        log.Fatal(err)
    }
    // get mongodb collections
    users = client.Database("timetabros").Collection("users")
    pendingUsers = client.Database("timetabros").Collection("pending_users")
    eventItems = client.Database("timetabros").Collection("event_items")

    // setup api routers
    router := gin.Default()
    store = sessions.NewCookieStore([]byte(securecookie.GenerateRandomKey(32)))
    gob.Register(&primitive.ObjectID{})
    //router.Use(static.Serve("/", static.LocalFile("./frontend", true)))
    api := router.Group("/api") 
    api.GET("/", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H {
            "message": "pong",
        })
    })



    // define api routes
    // TODO sanitize inputs
    // TODO check for authenticated
    router.POST("/signup", SignUp)
    router.GET("/verify/:token", Verify)
    router.POST("/signin", SignIn)
    router.GET("/signout", SignOut)

    api.POST("/event_items", CreateEventItem)



    router.Run(":3000")
}

func isAuthenticated(session *sessions.Session) bool {
    if session.Values["_id"] != nil {
        return true
    }
    return false
}

// signup api
// TODO send email
// curl -X POST -H "Content-Type: application/json" -d '{"username":"SnoopySnipe","password":"snoopy","firstname":"Andrew","lastname":"Leung","email":"andrewleung.41898@outlook.com"}' localhost:3000/signup
func SignUp(c *gin.Context) {
    // get data from request body and store into user type
    var user User
    if err := c.ShouldBindJSON(&user); err != nil {
    	c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
    // check if user already exists
    var existingUser User
    err := users.FindOne(context.TODO(), bson.M{"username": user.Username}).Decode(&existingUser)
    if err == nil {
        c.JSON(http.StatusConflict, gin.H{"error": "Username " + existingUser.Username + " already exists"})
    	return
    }
    err = users.FindOne(context.TODO(), bson.M{"email": user.Email}).Decode(&existingUser)
    if err == nil {
        c.JSON(http.StatusConflict, gin.H{"error": "Email " + existingUser.Email + " is already in use"})
	    return
    }
    // create salted hash and store it instead of password in clear
    hash, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	    return
    }
    user.Password = string(hash)
    // insert user into db
    user.Verified = 0
    insertedUser, err := users.InsertOne(context.TODO(), user)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	    return
    }
    // insert pending user into db
    var pendingUser PendingUser
    pendingUser.Userid = insertedUser.InsertedID.(primitive.ObjectID)
    insertedPendingUser, err := pendingUsers.InsertOne(context.TODO(), pendingUser)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    // send back response with user data and token
    c.JSON(http.StatusOK, gin.H{
        "_id": insertedUser.InsertedID,
        "username": user.Username,
        "firstname": user.Firstname,
        "lastname": user.Lastname,
        "email": user.Email,
        "token": insertedPendingUser.InsertedID,
    })
}

// verify api
// curl -X GET localhost:3000/verify/token
func Verify(c *gin.Context) {
    // get token and check that its valid
    token := c.Param("token")
    tokenObject, err := primitive.ObjectIDFromHex(token)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token " + token})
		return
    }
    // find the user that the token belongs to  
    var pendingUser PendingUser
    err = pendingUsers.FindOne(context.TODO(), bson.M{"_id": tokenObject}).Decode(&pendingUser)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Token " + token + " not found"})
	    return
    }
    var user User
    err = users.FindOne(context.TODO(), bson.M{"_id": pendingUser.Userid}).Decode(&user)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User " + pendingUser.Userid.String() + " not found"})
		return
    }
    // remove the pending user record
    _, err = pendingUsers.DeleteOne(context.TODO(), bson.M{"_id": tokenObject})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    // update the user to verified
    _, err = users.UpdateOne(context.TODO(), bson.M{"_id": pendingUser.Userid}, bson.M{"$set": bson.M{"verified": 1}})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    // send back response with user data
    c.JSON(http.StatusOK, gin.H{
        "_id": pendingUser.Userid,
        "username": user.Username,
        "firstname": user.Firstname,
        "lastname": user.Lastname,
        "email": user.Email,
    })
}

// signin api
// curl -c cookie.txt -X POST -H "Content-Type: application/json" -d '{"username":"SnoopySnipe","password":"snoopy"}' localhost:3000/signin
func SignIn(c *gin.Context) {
    // get credentials
    byte_data, err := c.GetRawData()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    data := &LoginCredentials{}
    err = json.Unmarshal(byte_data, data)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	    return
    }
    username := data.Username
    password := data.Password
    email := data.Email
    if (username == "" && email == "") || password == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Missing arguments"})
		return
    }
    // find user in db
    var user User
    var filter bson.M
    if username != "" {
        filter = bson.M{"username": username}
    } else if email != "" {
        filter = bson.M{"email": email}
    }
    err = users.FindOne(context.TODO(), filter).Decode(&user)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Access denied"})
		return
    }
    user_raw, err := users.FindOne(context.TODO(), filter).DecodeBytes()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    // compare passwords
    err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Access denied"})
		return
    }
    // check if verified
    if user.Verified == 0 {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Access denied"})
		return
    }
    // get session
    session, err := store.Get(c.Request, "session")
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    // write user id to session
    session.Values["_id"] = user_raw.Lookup("_id").ObjectID()
    err = session.Save(c.Request, c.Writer)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    // send response
    c.JSON(http.StatusOK, gin.H{
        "_id": user_raw.Lookup("_id").ObjectID(),
        "username": user.Username,
        "firstname": user.Firstname,
        "lastname": user.Lastname,
        "email": user.Email,
    })
}

// signout api
// curl -b cookie.txt -c cookie.txt -X GET localhost:3000/signout
func SignOut(c *gin.Context) {
    // get session
    session, err := store.Get(c.Request, "session")
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    // check if already signed out
    if session.Values["_id"] == nil {
        c.JSON(http.StatusOK, gin.H{
            "message": "Not signed in",
        })
        return
    }
    // remove user id from session
    session.Values["_id"] = nil
    err = session.Save(c.Request, c.Writer)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    // send response
    c.JSON(http.StatusOK, gin.H{
        "message": "Successfully signed out",
    })
}

func ConvertEventItem(event EventItem) (EventItemDB, error) {
    var eventDB EventItemDB
    eventDB.Createdby = event.Createdby
    startdate, err := time.Parse(layout, event.Startdate)
    if err != nil {
	    return eventDB, err
    }
    eventDB.Startdate = startdate
    enddate, err := time.Parse(layout, event.Enddate)
    if err != nil {
	    return eventDB, err
    }
    eventDB.Enddate = enddate
    eventDB.Title = event.Title
    eventDB.Description = event.Description
    var expirydate time.Time
    if event.Expirydate != "" {
        expirydate, err = time.Parse(layout, event.Expirydate)
        if err != nil {
	        return eventDB, err
        }
    } else {
        expirydate = time.Time{}
    }
    
    eventDB.Expirydate = expirydate
    eventDB.EventMembers = event.EventMembers
    return eventDB, nil
}

// TODO find user object ids in members, iterate through and store into db
func CreateEventItem(c *gin.Context) {
    session, err := store.Get(c.Request, "session")
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    if !(isAuthenticated(session)) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Access denied"})
		return
    }
    var event EventItem
    if err := c.ShouldBindJSON(&event); err != nil {
    	c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
    event.Createdby = session.Values["_id"].(*primitive.ObjectID)
    eventDB, err := ConvertEventItem(event)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	    return
    }
    insertedEvent, err := eventItems.InsertOne(context.TODO(), eventDB)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	    return
    }
    c.JSON(http.StatusOK, gin.H{
        "_id": insertedEvent.InsertedID,
        "createdby": eventDB.Createdby,
        "startdate": eventDB.Startdate,
        "enddate": eventDB.Enddate,
        "title": eventDB.Title,
        "description": eventDB.Description,
        "expirydate": eventDB.Expirydate,
        "members": eventDB.EventMembers,
    })
}


package main

import (
    "context"
    "log"
    "encoding/json"

    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"

    "net/http"

    //"github.com/gin-gonic/contrib/static"
    "github.com/gin-gonic/gin"

    "golang.org/x/crypto/bcrypt"
)

type User struct {
    _id primitive.ObjectID `json:"_id"`
    Username string `json:"username" binding:"required"`
    Firstname string `json:"firstname" binding:"required"`
    Lastname string `json:"lastname" binding:"required"`
    Email string `json:"email" binding:"required"`
    Password string `json:"password" binding:"required"`
    Verified int
}

type PendingUser struct {
    _id primitive.ObjectID `json:"_id"`
    Userid primitive.ObjectID
}

type Data struct {
    Username string `json:"username"`
    Password string `json:"password"`
}

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
    users := client.Database("timetabros").Collection("users")
    pendingUsers := client.Database("timetabros").Collection("pending_users")

    // setup api routers
    router := gin.Default()
    //router.Use(static.Serve("/", static.LocalFile("./frontend", true)))
    api := router.Group("/api") 
    api.GET("/", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H {
            "message": "pong",
        })
    })



    // define api routes
    // TODO sanitize inputs and check for authenticated

    // signup api
    router.POST("/signup", func(c *gin.Context) {
        // get data from requst body and store into user type
        var user User
        if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
        // check if user already exists
        var existingUser User
        err = users.FindOne(context.TODO(), bson.M{"username": user.Username}).Decode(&existingUser)
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
    })

    // verify api
    router.GET("/verify/:token", func(c *gin.Context) {
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
    })

    // signin api
    router.POST("/signin", func(c *gin.Context) {
        // get credentials
        byte_data, err := c.GetRawData()
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
        }
        data := &Data{}
        err = json.Unmarshal(byte_data, data)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
        }
        username := data.Username
        password := data.Password
        if username == "" || password == "" {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Missing arguments"})
			return
        }
        // find user in db
        var user User
        err = users.FindOne(context.TODO(), bson.M{"username": username}).Decode(&user)
        if err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Access denied"})
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
        log.Println(user)
        c.JSON(http.StatusOK, gin.H{
            "_id": user._id,
            "username": user.Username,
            "firstname": user.Firstname,
            "lastname": user.Lastname,
            "email": user.Email,
        })
    })



    router.Run(":3000")
}


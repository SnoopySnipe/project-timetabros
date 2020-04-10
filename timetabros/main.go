package main

import (
    "context"
    "log"
    "encoding/gob"
    "net/http"
    "net/smtp"
    "os"

    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
    "go.mongodb.org/mongo-driver/mongo/gridfs"

    "github.com/gin-gonic/gin"
    "github.com/gorilla/sessions"
    "github.com/gin-contrib/cors"

    "gopkg.in/go-playground/validator.v9"
)

const layout = "2006-01-02T15:04:05.000Z"

var users *mongo.Collection
var pendingUsers *mongo.Collection
var eventItems *mongo.Collection
var friendConnections *mongo.Collection
var groups *mongo.Collection
var profilePictures *mongo.Collection
var client *mongo.Client
var bucket *gridfs.Bucket

var store *sessions.CookieStore

var auth smtp.Auth
var email_setup EmailSetup

var validate *validator.Validate

func main() {
    // setup input validation
    validate = validator.New()

    // connect to mongodb
    clientOptions := options.Client().ApplyURI(mongo_destination)
    client, err := mongo.Connect(context.TODO(), clientOptions)
    if err != nil {
        log.Fatal(err)
    }
    err = client.Ping(context.TODO(), nil)
    if err != nil {
        log.Fatal(err)
    }
    // get mongodb collections
    users = client.Database(database_name).Collection("users")
    // index users for searching
    model := mongo.IndexModel{
        Keys: bson.M{"username": "text", "firstname": "text", "lastname": "text"},
        Options: nil,
    }
    users.Indexes().CreateOne(context.TODO(), model)
    pendingUsers = client.Database(database_name).Collection("pending_users")
    eventItems = client.Database(database_name).Collection("event_items")
    friendConnections = client.Database(database_name).Collection("friend_connections")
    groups = client.Database(database_name).Collection("groups")
    profilePictures = client.Database(database_name).Collection("profile_pictures")
    // create new mongodb gridfs bucket to store image uploads
    bucket, err = gridfs.NewBucket(
        client.Database(database_name),
    )
    if err != nil {
        log.Fatal(err)
    }


    // setup email
    email_setup = EmailSetup{Host: "smtp.gmail.com", Port: "587", Address: email_address, Password: email_password}
    auth = smtp.PlainAuth("", email_setup.Address, email_setup.Password, email_setup.Host)



    // setup api routers
    router := gin.Default()

    // setup cors headers
    config := cors.DefaultConfig()
    config.AllowOrigins = []string{front_site}
    config.AllowCredentials = true
    router.Use(cors.New(config))
    

    store = sessions.NewCookieStore([]byte(cookie_secret))
    gob.Register(&primitive.ObjectID{})
    //router.Use(static.Serve("/", static.LocalFile("./frontend", true)))
    api := router.Group("/api")
    api.GET("/", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H {
            "message": "pong",
        })
    })



    // define api routes

    // user apis
    router.POST("/signup", SignUp)
    router.GET("/verify/:token", Verify)
    router.POST("/signin", SignIn)
    router.GET("/signout", SignOut)
    api.GET("/users/:id", GetUserDetails)
    api.PATCH("/users", UpdateUserDetails)
    api.GET("/users", SearchUsers)
    router.POST("/reset", RequestPasswordReset)
    router.PATCH("/reset/:token", ResetPassword)
    api.GET("/users/:id/pfp", GetProfilePicture)

    // event apis
    api.POST("/event_items", CreateEventItem)
    api.GET("/event_items/:id", GetEventItemDetails)
    api.PATCH("/event_items/:id", UpdateEventItemDetails)
    api.DELETE("/event_items/:id", DeleteEventItem)
    api.GET("/users/:id/event_items", GetUserEvents)

    // friend apis
    api.POST("/friends", SendFriendRequest)
    api.PATCH("/friends/:id", AcceptFriendRequest)
    api.GET("/users/:id/friends", GetFriends)
    api.GET("/mutual_friend_recommendations", GetMutualFriendRecommendations)
    api.GET("/schedule_friend_recommendations", GetScheduleFriendRecommendations)
    api.DELETE("/friends", DeleteFriendConnection)

    // group apis
    api.POST("/groups", CreateGroup)
    api.GET("/groups/:id", GetGroupDetails)
    api.PATCH("/groups/:id", UpdateGroupDetails)
    api.DELETE("/groups/:id", DeleteGroup)
    api.GET("/users/:id/groups", GetUserGroups)

    // group request apis
    api.POST("/groups/:id/members", SendGroupRequest)
    api.PATCH("/groups/:id/members", AcceptGroupRequest)
    api.DELETE("/groups/:id/members", DeleteGroupMember)

    // event request apis
    api.POST("/event_items/:id/members", SendEventRequest)
    api.PATCH("/event_items/:id/members", UpdateEventStatus)
    api.DELETE("/event_items/:id/members", DeleteEventMember)


    var port string
    port = os.Getenv("PORT")
    if port == "" {
		port = "3001"
	}
    router.Run(":" + port)
}


package main

import (
    "context"
    "log"
    "encoding/gob"
    "net/http"
    "net/smtp"

    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"

    "github.com/gin-gonic/gin"
    "github.com/gorilla/sessions"
    //"github.com/gorilla/securecookie"
    "github.com/gin-contrib/cors"
)

const layout = "2006-01-02T15:04:05.000Z"

var users *mongo.Collection
var pendingUsers *mongo.Collection
var eventItems *mongo.Collection
var friendConnections *mongo.Collection
var groups *mongo.Collection
var store *sessions.CookieStore

var auth smtp.Auth
var email_setup EmailSetup
var site string

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
    // index users for searching
    model := mongo.IndexModel{
        Keys: bson.M{"username": "text", "firstname": "text", "lastname": "text"},
        Options: nil,
    }
    users.Indexes().CreateOne(context.TODO(), model)
    pendingUsers = client.Database("timetabros").Collection("pending_users")
    eventItems = client.Database("timetabros").Collection("event_items")
    friendConnections = client.Database("timetabros").Collection("friend_connections")
    groups = client.Database("timetabros").Collection("groups")



    // setup email
    site = "http://localhost:3001"
    email_setup = EmailSetup{Host: "smtp.gmail.com", Port: "587", Address: email_address, Password: email_password}
    auth = smtp.PlainAuth("", email_setup.Address, email_setup.Password, email_setup.Host)



    // setup api routers
    router := gin.Default()

    // setup cors headers
    config := cors.DefaultConfig()
    config.AllowOrigins = []string{"http://localhost:3000"}
    config.AllowCredentials = true
    router.Use(cors.New(config))
    
    //store = sessions.NewCookieStore([]byte(securecookie.GenerateRandomKey(32)))
    store = sessions.NewCookieStore([]byte("pleasechangeandstoreinconf"))
    gob.Register(&primitive.ObjectID{})
    //router.Use(static.Serve("/", static.LocalFile("./frontend", true)))
    api := router.Group("/api") 
    api.GET("/", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H {
            "message": "pong",
        })
    })



    // define api routes
    // TODO sanitize inputs, check inputs are logically valid, limit user inputs
    // TODO send notifications
    // TODO check for settings
    // TODO fix some error status codes
    router.POST("/signup", SignUp)
    router.GET("/verify/:token", Verify)
    router.POST("/signin", SignIn)
    router.GET("/signout", SignOut)
    api.GET("/users/:id", GetUserDetails)
    api.PATCH("/users", UpdateUserDetails)
    api.POST("/users", SearchUsers)

    api.POST("/event_items", CreateEventItem)
    api.GET("/event_items/:id", GetEventItemDetails)
    api.PATCH("/event_items/:id", UpdateEventItemDetails)
    api.DELETE("/event_items/:id", DeleteEventItem)
    api.GET("/users/:id/event_items", GetUserEvents)

    api.POST("/friends", SendFriendRequest)
    api.PATCH("/friends/:id", AcceptFriendRequest)
    api.GET("/users/:id/friends", GetFriends)
    api.DELETE("/friends", DeleteFriendConnection)

    api.POST("/groups", CreateGroup)
    api.GET("/groups/:id", GetGroupDetails)
    api.PATCH("/groups/:id", UpdateGroupDetails)
    api.DELETE("/groups/:id", DeleteGroup)
    api.GET("/users/:id/groups", GetUserGroups)

    api.POST("/groups/:id/members", SendGroupRequest)
    api.PATCH("/groups/:id/members", AcceptGroupRequest)
    api.DELETE("/groups/:id/members", DeleteGroupMember)

    api.POST("/event_items/:id/members", SendEventRequest)
    api.PATCH("/event_items/:id/members", UpdateEventStatus)
    api.DELETE("/event_items/:id/members", DeleteEventMember)



    router.Run(":3001")
}


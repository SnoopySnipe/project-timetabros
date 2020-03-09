package main

import (
    "context"
    "log"
    "encoding/gob"
    "net/http"

    "go.mongodb.org/mongo-driver/bson/primitive"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"

    "github.com/gin-gonic/gin"
    "github.com/gorilla/sessions"
    "github.com/gorilla/securecookie"
    "github.com/gin-contrib/cors"
)

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

    // setup cors headers
    config := cors.DefaultConfig()
    config.AllowOrigins = []string{"http://localhost:3000"}
    config.AllowCredentials = true
    router.Use(cors.New(config))
    
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
    // TODO sanitize inputs, check inputs are logically valid
    // TODO check for authenticated
    router.POST("/signup", SignUp)
    router.GET("/verify/:token", Verify)
    router.POST("/signin", SignIn)
    router.GET("/signout", SignOut)

    api.POST("/event_items", CreateEventItem)
    api.GET("/event_items/:id", GetEventItemDetails)
    api.PATCH("/event_items/:id", UpdateEventItemDetails)
    api.DELETE("/event_items/:id", DeleteEventItem)
    api.GET("/users/:id/event_items", GetUserEvents)



    router.Run(":3001")
}


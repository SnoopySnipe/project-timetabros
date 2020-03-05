package main

import (
    "context"
    //"encoding/json"
    "net/http"

    //"go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"

    "github.com/gin-gonic/gin"
)

// create event api
// curl -b cookie.txt -X POST -H "Content-Type: application/json" -d @data.txt localhost:3000/api/event_items
func CreateEventItem(c *gin.Context) {
    // get session
    session, err := store.Get(c.Request, "session")
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    // check if authenticated
    if !(isAuthenticated(session)) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Access denied"})
		return
    }
    // get event details
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
    // insert event into db
    insertedEvent, err := eventItems.InsertOne(context.TODO(), eventDB)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	    return
    }
    // send response
    c.JSON(http.StatusOK, gin.H{
        "_id": insertedEvent.InsertedID,
        "createdby": eventDB.Createdby,
        "creatorstatus": eventDB.Creatorstatus,
        "startdate": eventDB.Startdate,
        "enddate": eventDB.Enddate,
        "title": eventDB.Title,
        "description": eventDB.Description,
        "expirydate": eventDB.Expirydate,
        "eventmembers": eventDB.Eventmembers,
    })
}

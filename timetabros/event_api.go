package main

import (
    "context"
    "net/http"
    "time"

    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"

    "github.com/gin-gonic/gin"
)

// create event api
// curl -b cookie.txt -X POST -H "Content-Type: application/json" -d @data.txt localhost:3001/api/event_items
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

// get event details api
// curl -b cookie.txt -X GET localhost:3001/api/event_items/id
func GetEventItemDetails(c *gin.Context) {
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
    // get id and check that its valid
    id_param := c.Param("id")
    id, err := primitive.ObjectIDFromHex(id_param)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id " + id_param})
		return
    }
    // find the matching event
    var event EventItemDB
    err = eventItems.FindOne(context.TODO(), bson.M{"_id": id}).Decode(&event)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Event " + id_param + " not found"})
		return
    }
    // send response
    c.JSON(http.StatusOK, gin.H{
        "_id": id,
        "createdby": event.Createdby,
        "creatorstatus": event.Creatorstatus,
        "startdate": event.Startdate,
        "enddate": event.Enddate,
        "title": event.Title,
        "description": event.Description,
        "expirydate": event.Expirydate,
        "eventmembers": event.Eventmembers,
    })
}

// update event details api
// curl -b cookie.txt -X PATCH -H "Content-Type: application/json" -d @data.txt localhost:3001/api/event_items/id
func UpdateEventItemDetails(c *gin.Context) {
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
    // get id and check that its valid
    id_param := c.Param("id")
    id, err := primitive.ObjectIDFromHex(id_param)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id " + id_param})
		return
    }
    // find the matching event
    var eventDB EventItemDB
    err = eventItems.FindOne(context.TODO(), bson.M{"_id": id}).Decode(&eventDB)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Event " + id_param + " not found"})
		return
    }
    // verify that updater is owner of event
    if session.Values["_id"].(*primitive.ObjectID).String() != eventDB.Createdby.String() {
        c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		return
    }
    // get update credentials
    var event EventItem
    if err := c.ShouldBindJSON(&event); err != nil {
    	c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
    event.Createdby = session.Values["_id"].(*primitive.ObjectID)
    eventDB, err = ConvertEventItem(event)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	    return
    }
    // save event into db
    _, err = eventItems.UpdateOne(context.TODO(), bson.M{"_id": id}, bson.M{"$set": bson.M{"startdate": eventDB.Startdate, "enddate": eventDB.Enddate, "title": eventDB.Title, "description": eventDB.Description, "expirydate": eventDB.Expirydate}})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	    return
    }
    // send response
    c.JSON(http.StatusOK, gin.H{
        "_id": id,
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

// delete event item api
// curl -b cookie.txt -X DELETE localhost:3001/api/event_items/id
func DeleteEventItem(c *gin.Context) {
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
    // get id and check that its valid
    id_param := c.Param("id")
    id, err := primitive.ObjectIDFromHex(id_param)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id " + id_param})
		return
    }
    // find the matching event
    var eventDB EventItemDB
    err = eventItems.FindOne(context.TODO(), bson.M{"_id": id}).Decode(&eventDB)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Event " + id_param + " not found"})
		return
    }
    // verify that deleter is owner of event
    if session.Values["_id"].(*primitive.ObjectID).String() != eventDB.Createdby.String() {
        c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		return
    }
    // delete event from db
    _, err = eventItems.DeleteOne(context.TODO(), bson.M{"_id": id})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	    return
    }
    // send response
    c.JSON(http.StatusOK, gin.H{
        "_id": id,
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

// get user's events api
// curl -b cookie.txt -X GET localhost:3001/api/users/id/event_items
func GetUserEvents(c *gin.Context) {
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
    // get id and check that its valid
    id_param := c.Param("id")
    id, err := primitive.ObjectIDFromHex(id_param)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id " + id_param})
		return
    }
    // find the matching user
    var user User
    err = users.FindOne(context.TODO(), bson.M{"_id": id}).Decode(&user)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User " + id_param + " not found"})
		return
    }
    // get user's events
    userScheduleItems, err := eventItemFind(bson.M{"createdby": id, "creatorstatus": "", "expirydate": time.Time{}, "eventmembers": nil})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    userTempScheduleItems, err := eventItemFind(bson.M{"createdby": id, "creatorstatus": "", "expirydate": bson.M{"$ne": time.Time{}}, "eventmembers": nil})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    userEventOwnerItems, err := eventItemFind(bson.M{"createdby": id, "creatorstatus": bson.M{"$ne": ""}, "expirydate": time.Time{}})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    userEventMemberItems, err := eventItemFind(bson.M{"createdby": bson.M{"$ne": id}, "creatorstatus": bson.M{"$ne": ""}, "expirydate": time.Time{}, "eventmembers": bson.M{"$elemMatch": bson.M{"userid": id, "status": bson.M{"$ne": "invited"}}}})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    userEventRequestItems, err := eventItemFind(bson.M{"createdby": bson.M{"$ne": id}, "creatorstatus": bson.M{"$ne": ""}, "expirydate": time.Time{}, "eventmembers": bson.M{"$elemMatch": bson.M{"userid": id, "status": "invited"}}})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    // send response
    c.JSON(http.StatusOK, gin.H{
        "_id": id,
        "scheduleitems": userScheduleItems,
        "tempscheduleitems": userTempScheduleItems,
        "eventowneritems": userEventOwnerItems,
        "eventmemberitems": userEventMemberItems,
        "eventrequestitems": userEventRequestItems,
    })
}


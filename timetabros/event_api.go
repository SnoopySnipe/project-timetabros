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

	// verify inputs
	if errs := validate.Struct(event); errs != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": errs.Error()})
		return
	}

	eventDB, err := ConvertEventItem(event)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// verify event end date > start date
	if !(eventDB.Enddate.After(eventDB.Startdate)) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Event end date must be after start date"})
		return
	}
	// insert event into db
	insertedEvent, err := eventItems.InsertOne(context.TODO(), bson.M{"createdby": eventDB.Createdby, "creatorstatus": eventDB.Creatorstatus, "startdate": eventDB.Startdate, "enddate": eventDB.Enddate, "title": eventDB.Title, "description": eventDB.Description, "expirydate": eventDB.Expirydate, "eventmembers": eventDB.Eventmembers, "iscobalt": eventDB.Iscobalt})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// send response
	c.JSON(http.StatusOK, gin.H{
		"_id":           insertedEvent.InsertedID,
		"createdby":     eventDB.Createdby,
		"creatorstatus": eventDB.Creatorstatus,
		"startdate":     eventDB.Startdate,
		"enddate":       eventDB.Enddate,
		"title":         eventDB.Title,
		"description":   eventDB.Description,
		"expirydate":    eventDB.Expirydate,
		"eventmembers":  eventDB.Eventmembers,
		"iscobalt":      eventDB.Iscobalt,
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
		"_id":           id,
		"createdby":     event.Createdby,
		"creatorstatus": event.Creatorstatus,
		"startdate":     event.Startdate,
		"enddate":       event.Enddate,
		"title":         event.Title,
		"description":   event.Description,
		"expirydate":    event.Expirydate,
		"eventmembers":  event.Eventmembers,
		"iscobalt":      event.Iscobalt,
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
	var event EventItemUpdate
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// verify inputs
	if errs := validate.Struct(event); errs != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": errs.Error()})
		return
	}

	if event.Startdate != "" {
		startdate, err := time.Parse(layout, event.Startdate)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		eventDB.Startdate = startdate
	}
	if event.Enddate != "" {
		enddate, err := time.Parse(layout, event.Enddate)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		eventDB.Enddate = enddate
	}
	if event.Expirydate != "" {
		expirydate, err := time.Parse(layout, event.Expirydate)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		eventDB.Expirydate = expirydate
	}
	if event.Title != "" {
		eventDB.Title = event.Title
	}
	if event.Description != "" {
		eventDB.Description = event.Description
	}
	// verify event end date > start date
	if !(eventDB.Enddate.After(eventDB.Startdate)) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Event end date must be after start date"})
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
		"_id":           id,
		"createdby":     eventDB.Createdby,
		"creatorstatus": eventDB.Creatorstatus,
		"startdate":     eventDB.Startdate,
		"enddate":       eventDB.Enddate,
		"title":         eventDB.Title,
		"description":   eventDB.Description,
		"expirydate":    eventDB.Expirydate,
		"eventmembers":  eventDB.Eventmembers,
		"iscobalt":      eventDB.Iscobalt,
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
		"_id":           id,
		"createdby":     eventDB.Createdby,
		"creatorstatus": eventDB.Creatorstatus,
		"startdate":     eventDB.Startdate,
		"enddate":       eventDB.Enddate,
		"title":         eventDB.Title,
		"description":   eventDB.Description,
		"expirydate":    eventDB.Expirydate,
		"eventmembers":  eventDB.Eventmembers,
		"iscobalt":      eventDB.Iscobalt,
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
	// check user's privacy settings
	if session.Values["_id"].(*primitive.ObjectID).Hex() != id.Hex() {
		if user.Privacysettings.Schedule == "private" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
			return
		} else if user.Privacysettings.Schedule == "friends-only" {
			var friendConnectionDB FriendConnectionDB
			err = friendConnections.FindOne(context.TODO(), bson.M{"status": "accepted", "$or": []bson.M{bson.M{"user1": session.Values["_id"], "user2": id}, bson.M{"user1": id, "user2": session.Values["_id"]}}}).Decode(&friendConnectionDB)
			if err != nil {
				c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
				return
			}
		}
	}
	// get user's events
	userScheduleItems, err := eventItemFind(bson.M{"createdby": id, "creatorstatus": "", "expirydate": time.Time{}, "eventmembers": nil, "iscobalt": 0})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	courses, err := eventItemFind(bson.M{"createdby": id, "creatorstatus": "", "expirydate": time.Time{}, "eventmembers": nil, "iscobalt": 1})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	userTempScheduleItems, err := eventItemFind(bson.M{"createdby": id, "creatorstatus": "", "expirydate": bson.M{"$ne": time.Time{}}, "eventmembers": nil, "iscobalt": 0})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	userEventOwnerItems, err := eventItemFind(bson.M{"createdby": id, "creatorstatus": bson.M{"$ne": ""}, "expirydate": time.Time{}, "iscobalt": 0})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	userEventMemberItems, err := eventItemFind(bson.M{"createdby": bson.M{"$ne": id}, "creatorstatus": bson.M{"$ne": ""}, "expirydate": time.Time{}, "iscobalt": 0, "eventmembers": bson.M{"$elemMatch": bson.M{"userid": id, "status": bson.M{"$ne": "invited"}}}})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	userEventRequestItems, err := eventItemFind(bson.M{"createdby": bson.M{"$ne": id}, "creatorstatus": bson.M{"$ne": ""}, "expirydate": time.Time{}, "iscobalt": 0, "eventmembers": bson.M{"$elemMatch": bson.M{"userid": id, "status": "invited"}}})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// send response
	c.JSON(http.StatusOK, gin.H{
		"_id":               id,
		"scheduleitems":     userScheduleItems,
		"courses":           courses,
		"tempscheduleitems": userTempScheduleItems,
		"eventowneritems":   userEventOwnerItems,
		"eventmemberitems":  userEventMemberItems,
		"eventrequestitems": userEventRequestItems,
	})
}

// send event invite api
// curl -b cookie.txt -X POST -H "Content-Type: application/json" -d '{"userid":"userid"}' localhost:3001/api/event_items/id/members
func SendEventRequest(c *gin.Context) {
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
	// get user and group to send group request to
	var eventMember UserIDStruct
	if err = c.ShouldBindJSON(&eventMember); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	id_param := c.Param("id")
	// check if id is valid
	user_id, err := primitive.ObjectIDFromHex(eventMember.Userid)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id " + eventMember.Userid})
		return
	}
	event_id, err := primitive.ObjectIDFromHex(id_param)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id " + id_param})
		return
	}
	// verify that user is sending event request to another user
	if session.Values["_id"].(*primitive.ObjectID).String() == user_id.String() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot send event request to self"})
		return
	}
	// find the matching user
	var user User
	err = users.FindOne(context.TODO(), bson.M{"_id": user_id}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User " + eventMember.Userid + " not found"})
		return
	}
	// find the matching event
	var event EventItemDB
	err = eventItems.FindOne(context.TODO(), bson.M{"_id": event_id, "creatorstatus": bson.M{"$ne": ""}, "expirydate": time.Time{}}).Decode(&event)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event " + id_param + " not found"})
		return
	}
	var eventMemberDB EventMemberDB
	eventMemberDB.Status = "invited"
	eventMemberDB.Userid = user_id
	// verify that the sender is in the event and receiver is not
	var eventCheck1 EventItemDB
	err = eventItems.FindOne(context.TODO(), bson.M{"_id": event_id, "createdby": bson.M{"$ne": session.Values["_id"]}, "eventmembers": bson.M{"$not": bson.M{"$elemMatch": bson.M{"userid": session.Values["_id"]}}}}).Decode(&eventCheck1)
	if err == nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "User " + session.Values["_id"].(*primitive.ObjectID).String() + " is not in the event " + id_param})
		return
	}
	var eventCheck2 EventItemDB
	err = eventItems.FindOne(context.TODO(), bson.M{"_id": event_id, "$or": []bson.M{bson.M{"createdby": user_id}, bson.M{"eventmembers": bson.M{"$elemMatch": bson.M{"userid": user_id}}}}}).Decode(&eventCheck2)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User " + eventMember.Userid + " is already in event " + id_param})
		return
	}
	// insert event member
	event.Eventmembers = append(event.Eventmembers, eventMemberDB)
	_, err = eventItems.UpdateOne(context.TODO(), bson.M{"_id": event_id}, bson.M{"$set": bson.M{"eventmembers": event.Eventmembers}})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// send back response
	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully sent invite",
	})
}

// udpate event status api
// curl -b cookie.txt -X PATCH -H "Content-Type: application/json" -d '{"status":"going"}' localhost:3001/api/event_items/id/members
func UpdateEventStatus(c *gin.Context) {
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
	// get event to update status
	id_param := c.Param("id")
	// get status
	var status UpdateEventStatusCredentials
	if err = c.ShouldBindJSON(&status); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// verify inputs
	if errs := validate.Struct(status); errs != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": errs.Error()})
		return
	}
	// check if id is valid
	event_id, err := primitive.ObjectIDFromHex(id_param)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id " + id_param})
		return
	}
	// find the matching event
	var event EventItemDB
	err = eventItems.FindOne(context.TODO(), bson.M{"_id": event_id, "creatorstatus": bson.M{"$ne": ""}, "expirydate": time.Time{}}).Decode(&event)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event " + id_param + " not found"})
		return
	}
	// verify that accepter is invited to event
	var eventCheck1 Group
	err = eventItems.FindOne(context.TODO(), bson.M{"_id": event_id, "eventmembers": bson.M{"$elemMatch": bson.M{"userid": session.Values["_id"]}}}).Decode(&eventCheck1)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "User " + session.Values["_id"].(*primitive.ObjectID).String() + " is not invited to event " + id_param})
		return
	}
	// update event member
	var ems []EventMemberDB
	for _, em := range event.Eventmembers {
		if em.Userid.Hex() == session.Values["_id"].(*primitive.ObjectID).Hex() {
			em.Status = status.Status
		}
		ems = append(ems, em)
	}
	_, err = eventItems.UpdateOne(context.TODO(), bson.M{"_id": event_id}, bson.M{"$set": bson.M{"eventmembers": ems}})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// send back response
	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully updated status",
	})
}

// delete event member api
// curl -b cookie.txt -X DELETE -H "Content-Type: application/json" -d '{"userid":"userid"}' localhost:3001/api/event_items/id/members
func DeleteEventMember(c *gin.Context) {
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
	// get user and group to delete group member from
	var eventMember UserIDStruct
	if err = c.ShouldBindJSON(&eventMember); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	id_param := c.Param("id")
	// check if id is valid
	user_id, err := primitive.ObjectIDFromHex(eventMember.Userid)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id " + eventMember.Userid})
		return
	}
	event_id, err := primitive.ObjectIDFromHex(id_param)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id " + id_param})
		return
	}
	// find the matching user
	var user User
	err = users.FindOne(context.TODO(), bson.M{"_id": user_id}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User " + eventMember.Userid + " not found"})
		return
	}
	// find the matching event
	var event EventItemDB
	err = eventItems.FindOne(context.TODO(), bson.M{"_id": event_id, "creatorstatus": bson.M{"$ne": ""}, "expirydate": time.Time{}}).Decode(&event)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event " + id_param + " not found"})
		return
	}
	// verify that the deleter is either self or is admin
	if event.Createdby.Hex() == session.Values["_id"].(*primitive.ObjectID).Hex() {
		if session.Values["_id"].(*primitive.ObjectID).Hex() == user_id.Hex() {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Creator cannot delete self from event"})
			return
		}
	} else {
		if session.Values["_id"].(*primitive.ObjectID).Hex() != user_id.Hex() {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Members can only delete self from event"})
			return
		}
	}
	// verify that deleted is in member list
	var eventCheck1 EventItemDB
	err = eventItems.FindOne(context.TODO(), bson.M{"_id": event_id, "eventmembers": bson.M{"$elemMatch": bson.M{"userid": user_id}}}).Decode(&eventCheck1)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User " + user_id.String() + " is not in event " + id_param})
		return
	}
	// remove event member
	var ems []EventMemberDB
	for _, em := range event.Eventmembers {
		if em.Userid.Hex() != user_id.Hex() {
			ems = append(ems, em)
		}
	}
	_, err = eventItems.UpdateOne(context.TODO(), bson.M{"_id": event_id}, bson.M{"$set": bson.M{"eventmembers": ems}})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// send back response
	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully removed from event",
	})
}

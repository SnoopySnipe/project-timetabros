package main

import (
    "context"
    "net/http"

    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"

    "github.com/gin-gonic/gin"
)

// send friend request api
// curl -b cookie.txt -X POST -H "Content-Type: application/json" -d '{"userid":"userid"}' localhost:3001/api/friends
func SendFriendRequest (c *gin.Context) {
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
    // get user to send friend request to
    var friendConnection FriendConnection
    if err = c.ShouldBindJSON(&friendConnection); err != nil {
    	c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
    // check if id is valid
    id, err := primitive.ObjectIDFromHex(friendConnection.Userid)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id " + friendConnection.Userid})
		return
    }
    // verify that user is sending friend request to another user
    if session.Values["_id"].(*primitive.ObjectID).String() == id.String() {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot send friend request to self"})
		return
    }
    // find the matching user
    var user User
    err = users.FindOne(context.TODO(), bson.M{"_id": id}).Decode(&user)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User " + friendConnection.Userid + " not found"})
		return
    }
    // verify that the users are not already friends
    var friendConnectionDB FriendConnectionDB
    err = friendConnections.FindOne(context.TODO(), bson.M{"$or": []bson.M{bson.M{"user1": session.Values["_id"], "user2": id,},bson.M{"user1": id, "user2": session.Values["_id"],},},}).Decode(&friendConnectionDB)
    if err == nil && friendConnectionDB.Status == "accepted" {
        c.JSON(http.StatusConflict, gin.H{"error": "Already friends with user " + friendConnection.Userid})
	    return
    } else if err == nil && friendConnectionDB.Status == "pending" {
        c.JSON(http.StatusConflict, gin.H{"error": "There is already a pending friend request with user " + friendConnection.Userid})
	    return
    }
    // insert friend request into db
    friendConnectionDB.User1 = session.Values["_id"].(*primitive.ObjectID)
    friendConnectionDB.User2 = id
    friendConnectionDB.Status = "pending"
    insertedFriendConnection, err := friendConnections.InsertOne(context.TODO(), friendConnectionDB)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    // send back response with user data and token
    c.JSON(http.StatusOK, gin.H{
        "user1": friendConnectionDB.User1,
        "user2": friendConnectionDB.User2,
        "token": insertedFriendConnection.InsertedID,
    })
}

// accept friend request api
// curl -b cookie.txt -X PATCH localhost:3001/api/friends/token
func AcceptFriendRequest (c *gin.Context) {
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
    // find the matching friend connection
    var friendConnectionDB FriendConnectionDB
    err = friendConnections.FindOne(context.TODO(), bson.M{"_id": id, "status": "pending",}).Decode(&friendConnectionDB)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Friend request " + id_param + " not found"})
		return
    }
    // verify that accepter is the requested user
    if session.Values["_id"].(*primitive.ObjectID).String() != friendConnectionDB.User2.String() {
        c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		return
    }
    // update friend connection status
    _, err = friendConnections.UpdateOne(context.TODO(), bson.M{"_id": id}, bson.M{"$set": bson.M{"status": "accepted"}})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    // send back response with user data
    c.JSON(http.StatusOK, gin.H{
        "user1": friendConnectionDB.User1,
        "user2": friendConnectionDB.User2,
    })
}

// get user's friends api
// curl -b cookie.txt -X GET localhost:3001/api/users/id/friends
func GetFriends (c *gin.Context) {
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
    // get user's friends
    friends, err := friendFind(bson.M{"status": "accepted", "$or": []bson.M{bson.M{"user1": id}, bson.M{"user2": id}}})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    sentFriendRequests, err := friendFind(bson.M{"status": "pending", "user1": id})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    receivedFriendRequests, err := friendFind(bson.M{"status": "pending", "user2": id})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    // send response
    c.JSON(http.StatusOK, gin.H{
        "_id": id,
        "friends": friends,
        "sentfriendrequests": sentFriendRequests,
        "receivedfriendrequests": receivedFriendRequests,
    })
}

// delete friend connection api
// curl -b cookie.txt -X DELETE -H "Content-Type: application/json" -d '{"userid":"userid"}' localhost:3001/api/friends
func DeleteFriendConnection (c *gin.Context) {
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
    // get user to being deleted
    var friendConnection FriendConnection
    if err = c.ShouldBindJSON(&friendConnection); err != nil {
    	c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
    // check if id is valid
    id, err := primitive.ObjectIDFromHex(friendConnection.Userid)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id " + friendConnection.Userid})
		return
    }
    // verify that user is deleting another user
    if session.Values["_id"].(*primitive.ObjectID).String() == id.String() {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete self from friends"})
		return
    }
    // find the matching user
    var user User
    err = users.FindOne(context.TODO(), bson.M{"_id": id}).Decode(&user)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User " + friendConnection.Userid + " not found"})
		return
    }
    // verify that the users are friends
    var friendConnectionDB FriendConnectionDB
    err = friendConnections.FindOne(context.TODO(), bson.M{"$or": []bson.M{bson.M{"user1": session.Values["_id"], "user2": id,},bson.M{"user1": id, "user2": session.Values["_id"],},},}).Decode(&friendConnectionDB)
    if err != nil {
        c.JSON(http.StatusConflict, gin.H{"error": "Not friends with user " + friendConnection.Userid})
	    return
    }
    // delete friend from db
    _, err = friendConnections.DeleteOne(context.TODO(), bson.M{"$or": []bson.M{bson.M{"user1": session.Values["_id"], "user2": id,},bson.M{"user1": id, "user2": session.Values["_id"],},},})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    // send back response
    c.JSON(http.StatusOK, friendConnectionDB)
}


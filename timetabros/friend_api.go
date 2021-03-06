package main

import (
    "context"
    "net/http"
    "time"

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
    var friendConnection UserIDStruct
    if err = c.ShouldBindJSON(&friendConnection); err != nil {
    	c.JSON(http.StatusBadRequest, gin.H{"error": "Missing arguments"})
		return
	}
    // check if id is valid
    id, err := primitive.ObjectIDFromHex(friendConnection.Userid)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id " + friendConnection.Userid})
		return
    }
    // verify that user is sending friend request to another user
    if session.Values["_id"].(*primitive.ObjectID).Hex() == id.Hex() {
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
    _, err = friendConnections.InsertOne(context.TODO(), bson.M{"user1":friendConnectionDB.User1, "user2":friendConnectionDB.User2, "status":friendConnectionDB.Status})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    // send back response with user data and token
    c.JSON(http.StatusOK, gin.H{
        "message":"Successfully sent friend request",
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
        c.JSON(http.StatusNotFound, gin.H{"error": "Token " + id_param + " not found"})
		return
    }
    // verify that accepter is the requested user
    if session.Values["_id"].(*primitive.ObjectID).Hex() != friendConnectionDB.User2.Hex() {
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
        "message":"Successfully accepted friend request",
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
    // check user's privacy settings
    if session.Values["_id"].(*primitive.ObjectID).Hex() != id.Hex() {
        if user.Privacysettings.Profile == "private" {
            c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		    return
        } else if user.Privacysettings.Profile == "friends-only" {
            var friendConnectionDB FriendConnectionDB
            err = friendConnections.FindOne(context.TODO(), bson.M{"status": "accepted", "$or": []bson.M{bson.M{"user1": session.Values["_id"], "user2": id,},bson.M{"user1": id, "user2": session.Values["_id"],},},}).Decode(&friendConnectionDB)
            if err != nil {
                c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		        return
            }
        }
    }
    // get user's friends
    sentFriends, err := friendFind(bson.M{"status": "accepted", "user1": id}, 2)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    acceptedFriends, err := friendFind(bson.M{"status": "accepted", "user2": id}, 1)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    friends := append(sentFriends, acceptedFriends...)
    sentFriendRequests, err := friendFind(bson.M{"status": "pending", "user1": id}, 2)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    receivedFriendRequests, err := friendFind(bson.M{"status": "pending", "user2": id}, 1)
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

// get mutual friend recommendations api
// curl -b cookie.txt -X GET localhost:3001/api/mutual_friend_recommendations
func GetMutualFriendRecommendations(c *gin.Context) {
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
    id_param := session.Values["_id"].(*primitive.ObjectID).Hex()
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
    sentFriends, err := friendFind(bson.M{"status": "accepted", "user1": id}, 2)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    acceptedFriends, err := friendFind(bson.M{"status": "accepted", "user2": id}, 1)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    friends := append(sentFriends, acceptedFriends...)
    var friends_str []string
    for _, f := range friends {
        friends_str = append(friends_str, f.Userid)
    }
    // get user's pending friends
    sentFriendRequests, err := friendFind(bson.M{"status": "pending", "user1": id}, 2)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    receivedFriendRequests, err := friendFind(bson.M{"status": "pending", "user2": id}, 1)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    pending_friends := append(sentFriendRequests, receivedFriendRequests...)
    var pending_friends_str []string
    for _, pf := range pending_friends {
        pending_friends_str = append(pending_friends_str, pf.Userid)
    }
    // get mutual friends
    mutualFriends, err := MutualFriendFind(id_param, friends_str, pending_friends_str)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    // send response
    c.JSON(http.StatusOK, gin.H{
        "_id": id,
        "mutualfriends": mutualFriends,
    })
}

// get schedule friend recommendations api
// curl -b cookie.txt -X GET localhost:3001/api/schedule_friend_recommendations
func GetScheduleFriendRecommendations(c *gin.Context) {
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
    id_param := session.Values["_id"].(*primitive.ObjectID).Hex()
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
    // get user's connections
    connections1, err := friendFind(bson.M{"user1": id}, 2)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    connections2, err := friendFind(bson.M{"user2": id}, 1)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    connections := append(connections1, connections2...)
    var connections_str []string
    for _, connection := range connections {
        connections_str = append(connections_str, connection.Userid)
    }
    // get user's courses
    userCourses, err := eventItemFind(bson.M{"createdby": id, "creatorstatus": "", "expirydate": time.Time{}, "eventmembers": nil, "iscobalt": 1})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    var courses []string
    for _, course := range userCourses {
        if !(contains(courses, course.Title)) {
            courses = append(courses, course.Title)
        }
    }
    // get schedule friends
    var scheduleFriends []ScheduleFriend
    if len(courses) >= 1 {
        scheduleFriends, err = ScheduleFriendFind(id_param, connections_str, courses)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		    return
        }
    }
    // send response
    c.JSON(http.StatusOK, gin.H{
        "_id": id,
        "schedulefriends": scheduleFriends,
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
    var friendConnection UserIDStruct
    if err = c.ShouldBindJSON(&friendConnection); err != nil {
    	c.JSON(http.StatusBadRequest, gin.H{"error": "Missing arguments"})
		return
	}
    // check if id is valid
    id, err := primitive.ObjectIDFromHex(friendConnection.Userid)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id " + friendConnection.Userid})
		return
    }
    // verify that user is deleting another user
    if session.Values["_id"].(*primitive.ObjectID).Hex() == id.Hex() {
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
        c.JSON(http.StatusBadRequest, gin.H{"error": "Not friends with user " + friendConnection.Userid})
	    return
    }
    // delete friend from db
    _, err = friendConnections.DeleteOne(context.TODO(), bson.M{"$or": []bson.M{bson.M{"user1": session.Values["_id"], "user2": id,},bson.M{"user1": id, "user2": session.Values["_id"],},},})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    // send back response
    c.JSON(http.StatusOK, gin.H{
        "message":"Successfully removed friend",
    })
}


package main

import (
    "context"
    "net/http"

    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"

    "github.com/gin-gonic/gin"
)

// create group api
// curl -b cookie.txt -X POST -H "Content-Type: application/json" -d @data.txt localhost:3001/api/groups
func CreateGroup(c *gin.Context) {
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
    // get group details
    var group Group
    if err := c.ShouldBindJSON(&group); err != nil {
    	c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
    group.Createdby = session.Values["_id"].(*primitive.ObjectID)
    group.Creatorrole = "admin"
    // insert group into db
    insertedGroup, err := groups.InsertOne(context.TODO(), group)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	    return
    }
    // send response
    c.JSON(http.StatusOK, gin.H{
        "_id": insertedGroup.InsertedID,
        "createdby": group.Createdby,
        "creatorrole": group.Creatorrole,
        "name": group.Name,
        "about": group.About,
        "visibility": group.Visibility,
        "groupmembers": group.Groupmembers,
    })
}

// get group api
// curl -b cookie.txt -X GET localhost:3001/api/groups/id
func GetGroupDetails(c *gin.Context) {
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
    // find the matching group
    var group Group
    err = groups.FindOne(context.TODO(), bson.M{"_id": id}).Decode(&group)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Group " + id_param + " not found"})
		return
    }
    // send response
    c.JSON(http.StatusOK, gin.H{
        "_id": id,
        "createdby": group.Createdby,
        "creatorrole": group.Creatorrole,
        "name": group.Name,
        "about": group.About,
        "visibility": group.Visibility,
        "groupmembers": group.Groupmembers,
    })
}

// update group details api
// curl -b cookie.txt -X PATCH -H "Content-Type: application/json" -d @data.txt localhost:3001/api/groups/id
func UpdateGroupDetails(c *gin.Context) {
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
    // find the matching group
    var group Group
    err = groups.FindOne(context.TODO(), bson.M{"_id": id}).Decode(&group)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Group " + id_param + " not found"})
		return
    }
    // verify that updater is owner of group
    if session.Values["_id"].(*primitive.ObjectID).String() != group.Createdby.String() {
        c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		return
    }
    // get update credentials
    var updatedGroup Group
    if err := c.ShouldBindJSON(&updatedGroup); err != nil {
    	c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
    // save group into db
    group.Name = updatedGroup.Name
    group.About = updatedGroup.About
    group.Visibility = updatedGroup.Visibility
    _, err = groups.UpdateOne(context.TODO(), bson.M{"_id": id}, bson.M{"$set": bson.M{"name": group.Name, "about": group.About, "visibility": group.Visibility}})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	    return
    }
    // send response
    c.JSON(http.StatusOK, gin.H{
        "_id": id,
        "createdby": group.Createdby,
        "creatorrole": group.Creatorrole,
        "name": group.Name,
        "about": group.About,
        "visibility": group.Visibility,
        "groupmembers": group.Groupmembers,
    })
}

// delete group api
// curl -b cookie.txt -X DELETE localhost:3001/api/groups/id
func DeleteGroup(c *gin.Context) {
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
    // find the matching group
    var group Group
    err = groups.FindOne(context.TODO(), bson.M{"_id": id}).Decode(&group)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Group " + id_param + " not found"})
		return
    }
    // verify that deleter is owner of group
    if session.Values["_id"].(*primitive.ObjectID).String() != group.Createdby.String() {
        c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		return
    }
    // delete group from db
    _, err = groups.DeleteOne(context.TODO(), bson.M{"_id": id})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	    return
    }
    // send response
    c.JSON(http.StatusOK, gin.H{
        "_id": id,
        "createdby": group.Createdby,
        "creatorrole": group.Creatorrole,
        "name": group.Name,
        "about": group.About,
        "visibility": group.Visibility,
        "groupmembers": group.Groupmembers,
    })
}

// get user's groups api
// curl -b cookie.txt -X GET localhost:3001/api/users/id/groups
func GetUserGroups(c *gin.Context) {
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
    // get user's groups
    userOwnedGroups, err := groupFind(bson.M{"createdby": id})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    userMemberGroups, err := groupFind(bson.M{"createdby": bson.M{"$ne": id}, "groupmembers": bson.M{"$elemMatch": bson.M{"userid": id}}})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    // send response
    c.JSON(http.StatusOK, gin.H{
        "_id": id,
        "userownedgroups": userOwnedGroups,
        "usermembergroups": userMemberGroups,
    })
}


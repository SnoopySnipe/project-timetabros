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
    userMemberGroups, err := groupFind(bson.M{"createdby": bson.M{"$ne": id}, "groupmembers": bson.M{"$elemMatch": bson.M{"userid": id, "role": bson.M{"$ne": "invited"}}}})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    userRequestGroups, err := groupFind(bson.M{"createdby": bson.M{"$ne": id}, "groupmembers": bson.M{"$elemMatch": bson.M{"userid": id, "role": "invited"}}})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    // send response
    c.JSON(http.StatusOK, gin.H{
        "_id": id,
        "userownedgroups": userOwnedGroups,
        "usermembergroups": userMemberGroups,
        "userrequestgroups": userRequestGroups,
    })
}

// send group invite api
// curl -b cookie.txt -X POST -H "Content-Type: application/json" -d '{"userid":"userid"}' localhost:3001/api/groups/id/members
func SendGroupRequest(c *gin.Context) {
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
    var groupMember FriendConnection
    if err = c.ShouldBindJSON(&groupMember); err != nil {
    	c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
    id_param := c.Param("id")
    // check if id is valid
    user_id, err := primitive.ObjectIDFromHex(groupMember.Userid)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id " + groupMember.Userid})
		return
    }
    group_id, err := primitive.ObjectIDFromHex(id_param)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id " + id_param})
		return
    }
    // verify that user is sending group request to another user
    if session.Values["_id"].(*primitive.ObjectID).String() == user_id.String() {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot send group request to self"})
		return
    }
    // find the matching user
    var user User
    err = users.FindOne(context.TODO(), bson.M{"_id": user_id}).Decode(&user)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User " + groupMember.Userid + " not found"})
		return
    }
    // find the matching group
    var group Group
    err = groups.FindOne(context.TODO(), bson.M{"_id": group_id}).Decode(&group)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Group " + id_param + " not found"})
		return
    }
    var groupMemberDB GroupMember
    groupMemberDB.Role = "invited"
    groupMemberDB.Userid = user_id
    // verify that the sender is in the group and receiver is not
    var groupCheck1 Group
    err = groups.FindOne(context.TODO(), bson.M{"_id": group_id, "createdby": bson.M{"$ne": session.Values["_id"]}, "groupmembers": bson.M{"$not": bson.M{"$elemMatch": bson.M{"userid": session.Values["_id"]}}}}).Decode(&groupCheck1)
    if err == nil {
        c.JSON(http.StatusForbidden, gin.H{"error": "User " + session.Values["_id"].(*primitive.ObjectID).String() + " is not in the group " + id_param})
	    return
    } 
    var groupCheck2 Group
    err = groups.FindOne(context.TODO(), bson.M{"_id": group_id, "$or": []bson.M{bson.M{"createdby": user_id},bson.M{"groupmembers": bson.M{"$elemMatch": bson.M{"userid": user_id}}},},}).Decode(&groupCheck2)
    if err == nil {
        c.JSON(http.StatusConflict, gin.H{"error": "User " + groupMember.Userid + " is already in group " + id_param})
	    return
    }
    // insert group member
    group.Groupmembers = append(group.Groupmembers, groupMemberDB)
    _, err = groups.UpdateOne(context.TODO(), bson.M{"_id": group_id}, bson.M{"$set": bson.M{"groupmembers": group.Groupmembers}})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	    return
    }
    // send back response
    c.JSON(http.StatusOK, gin.H{
        "_id": group_id,
        "createdby": group.Createdby,
        "creatorrole": group.Creatorrole,
        "name": group.Name,
        "about": group.About,
        "visibility": group.Visibility, 
        "groupmembers": group.Groupmembers,
    })
}

// accept group invite api
// curl -b cookie.txt -X PATCH localhost:3001/api/groups/id/members
func AcceptGroupRequest(c *gin.Context) {
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
    // get group to accept request
    id_param := c.Param("id")
    // check if id is valid
    group_id, err := primitive.ObjectIDFromHex(id_param)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id " + id_param})
		return
    }
    // find the matching group
    var group Group
    err = groups.FindOne(context.TODO(), bson.M{"_id": group_id}).Decode(&group)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Group " + id_param + " not found"})
		return
    }
    // verify that accepter is invited to group
    var groupCheck1 Group
    err = groups.FindOne(context.TODO(), bson.M{"_id": group_id, "groupmembers": bson.M{"$elemMatch": bson.M{"userid": session.Values["_id"], "role": "invited"}}}).Decode(&groupCheck1)
    if err != nil {
        c.JSON(http.StatusConflict, gin.H{"error": "User " + session.Values["_id"].(*primitive.ObjectID).String() + " is not invited to group " + id_param})
	    return
    }
    // update group member
    var gms []GroupMember
    for _, gm := range group.Groupmembers {
        if gm.Userid.Hex() == session.Values["_id"].(*primitive.ObjectID).Hex() {
            gm.Role = "member"
        }
        gms = append(gms, gm)
    }
    _, err = groups.UpdateOne(context.TODO(), bson.M{"_id": group_id}, bson.M{"$set": bson.M{"groupmembers": gms}})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	    return
    }
    // send back response
    c.JSON(http.StatusOK, gin.H{
        "_id": group_id,
        "createdby": group.Createdby,
        "creatorrole": group.Creatorrole,
        "name": group.Name,
        "about": group.About,
        "visibility": group.Visibility, 
        "groupmembers": gms,
    })
}

// delete group member api
// curl -b cookie.txt -X DELETE -H "Content-Type: application/json" -d '{"userid":"userid"}' localhost:3001/api/groups/id/members
func DeleteGroupMember(c *gin.Context) {
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
    var groupMember FriendConnection
    if err = c.ShouldBindJSON(&groupMember); err != nil {
    	c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
    id_param := c.Param("id")
    // check if id is valid
    user_id, err := primitive.ObjectIDFromHex(groupMember.Userid)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id " + groupMember.Userid})
		return
    }
    group_id, err := primitive.ObjectIDFromHex(id_param)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id " + id_param})
		return
    }
    // find the matching user
    var user User
    err = users.FindOne(context.TODO(), bson.M{"_id": user_id}).Decode(&user)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User " + groupMember.Userid + " not found"})
		return
    }
    // find the matching group
    var group Group
    err = groups.FindOne(context.TODO(), bson.M{"_id": group_id}).Decode(&group)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Group " + id_param + " not found"})
		return
    }
    // verify that the deleter is either self or is admin
    if group.Createdby.Hex() == session.Values["_id"].(*primitive.ObjectID).Hex() {
        if session.Values["_id"].(*primitive.ObjectID).Hex() == user_id.Hex() {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Admin cannot delete self from group"})
		    return
        }
    } else {
        if session.Values["_id"].(*primitive.ObjectID).Hex() != user_id.Hex() {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Members can only delete self from group"})
		    return
        }
    }
    // verify that deleted is in member list
    var groupCheck1 Group
    err = groups.FindOne(context.TODO(), bson.M{"_id": group_id, "groupmembers": bson.M{"$elemMatch": bson.M{"userid": user_id}}}).Decode(&groupCheck1)
    if err != nil {
        c.JSON(http.StatusConflict, gin.H{"error": "User " + user_id.String() + " is not in group " + id_param})
	    return
    }
    // remove group member
    var gms []GroupMember
    for _, gm := range group.Groupmembers {
        if gm.Userid.Hex() != user_id.Hex() {
            gms = append(gms, gm)
        }
    }
    _, err = groups.UpdateOne(context.TODO(), bson.M{"_id": group_id}, bson.M{"$set": bson.M{"groupmembers": gms}})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	    return
    }
    // send back response
    c.JSON(http.StatusOK, gin.H{
        "_id": group_id,
        "createdby": group.Createdby,
        "creatorrole": group.Creatorrole,
        "name": group.Name,
        "about": group.About,
        "visibility": group.Visibility, 
        "groupmembers": gms,
    })
}



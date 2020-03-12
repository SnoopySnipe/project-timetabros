package main

import (
    "context"
    "encoding/json"
    "time"

    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"

    "github.com/gorilla/sessions"
)

func isAuthenticated(session *sessions.Session) bool {
    if session.Values["_id"] != nil {
        return true
    }
    return false
}

func ConvertEventItem(event EventItem) (EventItemDB, error) {
    var eventDB EventItemDB
    eventDB.Createdby = event.Createdby
    eventDB.Creatorstatus = event.Creatorstatus
    startdate, err := time.Parse(layout, event.Startdate)
    if err != nil {
	    return eventDB, err
    }
    eventDB.Startdate = startdate
    enddate, err := time.Parse(layout, event.Enddate)
    if err != nil {
	    return eventDB, err
    }
    eventDB.Enddate = enddate
    eventDB.Title = event.Title
    eventDB.Description = event.Description
    var expirydate time.Time
    if event.Expirydate != "" {
        expirydate, err = time.Parse(layout, event.Expirydate)
        if err != nil {
	        return eventDB, err
        }
    } else {
        expirydate = time.Time{}
    }
    eventDB.Expirydate = expirydate

    var eventmemberDB EventMemberDB
    var eventmemberDB_id primitive.ObjectID
    var user User
    eventmembers_data := []EventMember{}
    if event.Eventmembers != "" {
        err = json.Unmarshal([]byte(event.Eventmembers), &eventmembers_data)
        if err != nil {
            return eventDB, err
        }
    }
    for _, eventmember := range eventmembers_data {
        eventmemberDB_id, err = primitive.ObjectIDFromHex(eventmember.Userid)
        if err != nil {
            return eventDB, err
        }
        err = users.FindOne(context.TODO(), bson.M{"_id": eventmemberDB_id}).Decode(&user)
        if err != nil {
            return eventDB, err
        }
        eventmemberDB.Userid = eventmemberDB_id
        eventmemberDB.Status = eventmember.Status
        eventDB.Eventmembers = append(eventDB.Eventmembers, eventmemberDB)
    }
    
    return eventDB, nil
}

func eventItemFind(filter bson.M) ([]EventItemDB, error) {
    var err error
    var items []EventItemDB
    var item EventItemDB

    cur, err := eventItems.Find(context.Background(), filter)
    if err != nil {
        return items, err
    }
    defer cur.Close(context.Background())
    for cur.Next(context.Background()) {
        err = cur.Decode(&item)
        if err != nil {
            return items, err
        }
        items = append(items, item)
    }
    if err = cur.Err(); err != nil {
        return items, err
    }
    return items, err
}

func friendFind(filter bson.M) ([]FriendConnectionDB, error) {
    var err error
    var friends []FriendConnectionDB
    var friend FriendConnectionDB

    cur, err := friendConnections.Find(context.Background(), filter)
    if err != nil {
        return friends, err
    }
    defer cur.Close(context.Background())
    for cur.Next(context.Background()) {
        err = cur.Decode(&friend)
        if err != nil {
            return friends, err
        }
        friends = append(friends, friend)
    }
    if err = cur.Err(); err != nil {
        return friends, err
    }
    return friends, err
}


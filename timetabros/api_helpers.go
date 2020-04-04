package main

import (
    "context"
    "encoding/json"
    "time"
    "sort"

    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"
    "go.mongodb.org/mongo-driver/mongo/options"

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

    eventDB.Iscobalt = 0
    eventDB.Iscobalt = event.Iscobalt
    
    return eventDB, nil
}

func eventItemFind(filter bson.M) ([]EventItemDB, error) {
    var err error
    var items []EventItemDB

    cur, err := eventItems.Find(context.Background(), filter)
    if err != nil {
        return items, err
    }
    defer cur.Close(context.Background())
    for cur.Next(context.Background()) {
        var item EventItemDB
        err = cur.Decode(&item)
        if err != nil {
            return items, err
        }
        raw := cur.Current
        item.ID = raw.Lookup("_id").ObjectID()
        items = append(items, item)
    }
    if err = cur.Err(); err != nil {
        return items, err
    }
    return items, err
}

func friendFind(filter bson.M, userProjection int) ([]FriendStruct, error) {
    var err error
    var friends []FriendStruct

    cur, err := friendConnections.Find(context.Background(), filter)
    if err != nil {
        return friends, err
    }
    defer cur.Close(context.Background())
    for cur.Next(context.Background()) {
        var friend FriendConnectionDB
        err = cur.Decode(&friend)
        if err != nil {
            return friends, err
        }
        raw := cur.Current
        friend.ID = raw.Lookup("_id").ObjectID()
        var friendID FriendStruct
        if userProjection == 1 {
            friendID.Userid = friend.User1.Hex()
            friendID.ID = friend.ID
        } else if userProjection == 2 {
            friendID.Userid = friend.User2.Hex()
            friendID.ID = friend.ID
        }
        friends = append(friends, friendID)
    }
    if err = cur.Err(); err != nil {
        return friends, err
    }
    return friends, err
}

func contains(s []string, e string) bool {
    for _, a := range s {
        if a == e {
            return true
        }
    }
    return false
}

func MutualFriendFind(userid string, friends []string, pending_friends []string) ([]MutualFriend, error) {
    var err error
    var mutualFriends []MutualFriend

    var raw_mf []FriendStruct
    for _, f := range friends {
        
        id, err := primitive.ObjectIDFromHex(f)
        if err != nil {
            return mutualFriends, err
        }

        sentFriends, err := friendFind(bson.M{"status": "accepted", "user1": id}, 2)
        if err != nil {
            return mutualFriends, err
        }
        acceptedFriends, err := friendFind(bson.M{"status": "accepted", "user2": id}, 1)
        if err != nil {
            return mutualFriends, err
        }
        raw_mf = append(raw_mf, sentFriends...)
        raw_mf = append(raw_mf, acceptedFriends...)
    }

    var filtered_mf []string
    for _, raw := range raw_mf {
        found1 := contains(friends, raw.Userid)
        found2 := contains(pending_friends, raw.Userid)
        found3 := raw.Userid == userid
        if !(found1 || found2 || found3) {
            filtered_mf = append(filtered_mf, raw.Userid)
        }
    }

    counter := make(map[string]int)
    for _, mf := range filtered_mf {
        _, exist := counter[mf]
        if exist {
            counter[mf] += 1
        } else {
            counter[mf] = 1
        }
    }

    for k, v := range counter {
        mf_id, err := primitive.ObjectIDFromHex(k)
        if err != nil {
            return mutualFriends, err
        }
        new_mf := MutualFriend{Userid: mf_id, Count: v}
        mutualFriends = append(mutualFriends, new_mf)
    }

    sort.Slice(mutualFriends, func(i, j int) bool {
      return mutualFriends[i].Count > mutualFriends[j].Count
    })

    return mutualFriends[:10], err
}

func ScheduleFriendFind(userid string, connections []string, courses []string) ([]ScheduleFriend, error) {
    var err error
    var scheduleFriends []ScheduleFriend
    var filteredScheduleFriends []ScheduleFriend

    var raw_sf []EventItemDB
    for _, course := range courses {
        sf, err := eventItemFind(bson.M{"title": course, "creatorstatus": "", "expirydate": time.Time{}, "eventmembers": nil, "iscobalt": 1})
        if err != nil {
            return filteredScheduleFriends, err
        }
        raw_sf = append(raw_sf, sf...)
    }

    for _, raw := range raw_sf {
        found1 := contains(connections, raw.Createdby.Hex())
        found2 := userid == raw.Createdby.Hex()
        found3 := false
        if !(found1 || found2) {
            i := 0
            for _, scheduleFriend := range scheduleFriends {
                if scheduleFriend.Userid.Hex() == raw.Createdby.Hex() {
                    if !(contains(scheduleFriend.Courses, raw.Title)) {
                        scheduleFriend.Courses = append(scheduleFriend.Courses, raw.Title)
                        scheduleFriend.Count += 1
                        scheduleFriends[i] = scheduleFriend
                    }
                    found3 = true
                    break
                }
                i += 1
            }
            if !found3 {
                sf_id, err := primitive.ObjectIDFromHex(raw.Createdby.Hex())
                if err != nil {
                    return filteredScheduleFriends, err
                }
                new_sf := ScheduleFriend{Userid: sf_id, Count: 1, Courses: []string{raw.Title}}
                scheduleFriends = append(scheduleFriends, new_sf)
            }
        }
    }

    check := 1
    if len(courses) > 1 {
        check = len(courses) - 1
    }
    for _, filtered_sf := range scheduleFriends {
        if filtered_sf.Count >= check {
            filteredScheduleFriends = append(filteredScheduleFriends, filtered_sf)
        }
    }
    sort.Slice(filteredScheduleFriends, func(i, j int) bool {
      return filteredScheduleFriends[i].Count > FilteredScheduleFriends[j].Count
    })
    return filteredScheduleFriends[:10], err
}

func groupFind(filter bson.M) ([]Group, error) {
    var err error
    var groupsRes []Group

    cur, err := groups.Find(context.Background(), filter)
    if err != nil {
        return groupsRes, err
    }
    defer cur.Close(context.Background())
    for cur.Next(context.Background()) {
        var group Group
        err = cur.Decode(&group)
        if err != nil {
            return groupsRes, err
        }
        raw := cur.Current
        group.ID = raw.Lookup("_id").ObjectID()
        groupsRes = append(groupsRes, group)
    }
    if err = cur.Err(); err != nil {
        return groupsRes, err
    }
    return groupsRes, err
}

func userFind(filter bson.M) ([]SearchUserResult, error) {
    var err error
    var results []SearchUserResult

    cur, err := users.Find(context.Background(), filter, options.Find().SetProjection(bson.M{"score": bson.M{"$meta": "textScore"}}).SetSort(bson.M{"score": bson.M{"$meta": "textScore"}}))
    if err != nil {
        return results, err
    }
    defer cur.Close(context.Background())
    for cur.Next(context.Background()) {
        var result SearchUserResult
        raw := cur.Current
        result.ID = raw.Lookup("_id").ObjectID()
        result.Username = raw.Lookup("username").StringValue()
        result.Firstname = raw.Lookup("firstname").StringValue()
        result.Lastname = raw.Lookup("lastname").StringValue()
        results = append(results, result)
    }
    if err = cur.Err(); err != nil {
        return results, err
    }
    return results, err
}


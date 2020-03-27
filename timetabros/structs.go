package main

import (
    "time"

    "go.mongodb.org/mongo-driver/bson/primitive"
)

type EmailSetup struct {
    Host string
    Port string
    Address string
    Password string
}

type User struct {
    Username string `json:"username" binding:"required"`
    Firstname string `json:"firstname" binding:"required"`
    Lastname string `json:"lastname" binding:"required"`
    Email string `json:"email" binding:"required"`
    Password string `json:"password" binding:"required"`
    Verified int
    Notificationsettings NotificationSettings `json:"notificationsettings"`
    Privacysettings PrivacySettings `json:"privacysettings"`
}

type UserUpdate struct {
    Username string `json:"username"`
    Firstname string `json:"firstname"`
    Lastname string `json:"lastname"`
    Email string `json:"email"`
    Password string `json:"password"`
    Notificationsettings NotificationSettings `json:"notificationsettings"`
    Privacysettings PrivacySettings `json:"privacysettings"`
}

type SearchUserResult struct {
    ID primitive.ObjectID `json:"ID"`
    Username string `json:"username"`
    Firstname string `json:"firstname"`
    Lastname string `json:"lastname"`
    Email string `json:"email"`
}

type SearchUserCredentials struct {
    Query string `json:"query"`
}

type NotificationSettings struct {
    Email string `json:"email"`
    Inapp string `json:"inapp"`
}

type PrivacySettings struct {
    Profile string `json:"profile"`
    Schedule string `json:"schedule"`
}

type PendingUser struct {
    Userid primitive.ObjectID
}

type LoginCredentials struct {
    Username string `json:"username"`
    Password string `json:"password" binding:"required"`
    Email string `json:"email"`
}

type EventItem struct {
    Createdby *primitive.ObjectID
    Creatorstatus string `json:"creatorstatus"`
    Startdate string `json:"startdate" binding:"required"`
    Enddate string `json:"enddate" binding:"required"`
    Title string `json:"title" binding:"required"`
    Description string `json:"description"`
    Expirydate string `json:"expirydate"`
    Eventmembers string `json:"eventmembers"`
}

type EventItemUpdate struct {
    Startdate string `json:"startdate"`
    Enddate string `json:"enddate"`
    Title string `json:"title"`
    Description string `json:"description"`
    Expirydate string `json:"expirydate"`
}

type EventItemDB struct {
    ID primitive.ObjectID `json:"ID"`
    Createdby *primitive.ObjectID `json:"createdby" binding:"required"`
    Creatorstatus string `json:"creatorstatus"`
    Startdate time.Time `json:"startdate" binding:"required"`
    Enddate time.Time `json:"enddate" binding:"required"`
    Title string `json:"title" binding:"required"`
    Description string `json:"description"`
    Expirydate time.Time `json:"expirydate"`
    Eventmembers []EventMemberDB `json:"eventmembers"`
}

type UpdateEventStatusCredentials struct {
    Status string
}

type EventMember struct {
    Userid string `json:"userid" binding:"required"`
    Status string `json:"status" binding:"required"`
}

type EventMemberDB struct {
    Userid primitive.ObjectID `json:"userid" binding:"required"`
    Status string `json:"status" binding:"required"`
}

type FriendConnection struct {
    Userid string `json:"userid" binding:"required"`
}

type FriendConnectionDB struct {
    ID primitive.ObjectID `json:"ID"`
    User1 *primitive.ObjectID `json:"user1" binding:"required"`
    User2 primitive.ObjectID `json:"user2" binding:"required"`
    Status string `json:"status" binding:"required"`
}

type Group struct {
    ID primitive.ObjectID `json:"ID"`
    Createdby *primitive.ObjectID `json:"createdby"`
    Creatorrole string `json:"creatorrole"`
    Name string `json:"name" binding:"required"`
    About string `json:"about"`
    Visibility string `json:"visibility" binding:"required"`
    Groupmembers []GroupMember `json:"groupmembers"`
}

type GroupUpdate struct {
    Name string `json:"name"`
    About string `json:"about"`
    Visibility string `json:"visibility"`
}

type GroupMember struct {
    Userid primitive.ObjectID `json:"userid" binding:"required"`
    Role string `json:"role"`
}


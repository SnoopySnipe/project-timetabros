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
    Username string `json:"username" binding:"required" validate:"alphanum min=8 max=20"`
    Firstname string `json:"firstname" binding:"required" validate:"alpha min=2 max=20"`
    Lastname string `json:"lastname" binding:"required" validate:"alpha min=2 max=20"`
    Email string `json:"email" binding:"required" validate:"email"`
    Password string `json:"password" binding:"required" validate:"printascii min=8 max=30"`
    Verified int
    Notificationsettings NotificationSettings `json:"notificationsettings"`
    Privacysettings PrivacySettings `json:"privacysettings"`
}

type UserUpdate struct {
    Username string `json:"username" validate:"alphanum omitempty min=8 max=20"`
    Firstname string `json:"firstname" validate:"alpha omitempty min=2 max=20"`
    Lastname string `json:"lastname" validate:"alpha omitempty min=2 max=20"`
    Email string `json:"email" validate:"email omitempty"`
    Password string `json:"password" validate:"printascii omitempty min=8 max=30"`
    Notificationsettings NotificationSettings `json:"notificationsettings" validate:"omitempty"`
    Privacysettings PrivacySettings `json:"privacysettings" validate:"omitempty"`
}

type SearchUserResult struct {
    ID primitive.ObjectID `json:"ID"`
    Username string `json:"username"`
    Firstname string `json:"firstname"`
    Lastname string `json:"lastname"`
    Email string `json:"email"`
}

type SearchUserCredentials struct {
    Query string `json:"query" binding:"required" validate:"alphanum"`
}

type NotificationSettings struct {
    Email string `json:"email" validate:"omitempty oneof=allowed not-allowed"`
    Inapp string `json:"inapp" validate:"omitempty oneof=allowed not-allowed"`
}

type PrivacySettings struct {
    Profile string `json:"profile" validate:"omitempty oneof=public private friends-only"`
    Schedule string `json:"schedule" validate:"omitempty oneof=public private friends-only"`
}

type PendingUser struct {
    Userid primitive.ObjectID
}

type LoginCredentials struct {
    Username string `json:"username" validate:"alphanum omitempty"`
    Password string `json:"password" binding:"required" validate:"printascii"`
    Email string `json:"email" validate:"email omitempty"`
}

type EventItem struct {
    Createdby *primitive.ObjectID
    Creatorstatus string `json:"creatorstatus" validate:"omitempty oneof=going not-going invited interested"`
    Startdate string `json:"startdate" binding:"required"`
    Enddate string `json:"enddate" binding:"required"`
    Title string `json:"title" binding:"required" validate:"printascii max=30"`
    Description string `json:"description" validate:"printascii omitempty max=2000"`
    Expirydate string `json:"expirydate"`
    Eventmembers string `json:"eventmembers" validate:"omitempty"`
}

type EventItemUpdate struct {
    Startdate string `json:"startdate"`
    Enddate string `json:"enddate"`
    Title string `json:"title" validate:"printascii max=30"`
    Description string `json:"description" validate:"printascii omitempty max=2000"`
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
    Status string `json:"status" binding:"required" validate:"oneof=going not-going invited interested"`
}

type EventMember struct {
    Userid string `json:"userid" binding:"required"`
    Status string `json:"status" binding:"required" validate:"omitempty oneof=going not-going invited interested"`
}

type EventMemberDB struct {
    Userid primitive.ObjectID `json:"userid" binding:"required"`
    Status string `json:"status" binding:"required" validate:"oneof=going not-going invited interested"`
}

type UserIDStruct struct {
    Userid string `json:"userid" binding:"required"`
}

type FriendConnectionDB struct {
    ID primitive.ObjectID `json:"ID"`
    User1 *primitive.ObjectID `json:"user1" binding:"required"`
    User2 primitive.ObjectID `json:"user2" binding:"required"`
    Status string `json:"status" binding:"required" validate:"oneof=pending accepted"`
}

type Group struct {
    ID primitive.ObjectID `json:"ID"`
    Createdby *primitive.ObjectID `json:"createdby"`
    Creatorrole string `json:"creatorrole" validate:"eq=admin"`
    Name string `json:"name" binding:"required" validate:"printascii max=30"`
    About string `json:"about" validate:"printascii omitempty max=2000"`
    Visibility string `json:"visibility" binding:"required" validate:"oneof=public private"`
    Groupmembers []GroupMember `json:"groupmembers" validate:"omitempty"`
}

type GroupUpdate struct {
    Name string `json:"name" validate:"omitempty printascii max=30"`
    About string `json:"about" validate:"omitempty printascii max=2000"`
    Visibility string `json:"visibility" validate:"omitempty oneof=public private"`
}

type GroupMember struct {
    Userid primitive.ObjectID `json:"userid" binding:"required"`
    Role string `json:"role" binding:"required" validate:"omitempty oneof=invited memeber"`
}


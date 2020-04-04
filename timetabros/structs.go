package main

import (
    "time"

    "go.mongodb.org/mongo-driver/bson/primitive"

    "mime/multipart"
)

type EmailSetup struct {
    Host string
    Port string
    Address string
    Password string
}

type ProfilePicture struct {
    Userid primitive.ObjectID
    Picture multipart.FileHeader
}

type ResetCredentials struct {
    Email string `json:"email" binding:"required" validate:"email"`
}

type PasswordReset struct {
    Password string `json:"password" binding:"required" validate:"printascii,min=8,max=30"`
}

type User struct {
    Username string `json:"username" binding:"required" validate:"alphanum,min=3,max=20"`
    Firstname string `json:"firstname" binding:"required" validate:"alpha,min=2,max=20"`
    Lastname string `json:"lastname" binding:"required" validate:"alpha,min=2,max=20"`
    Email string `json:"email" binding:"required" validate:"email"`
    Password string `json:"password" binding:"required" validate:"printascii,min=8,max=30"`
    Verified int
    Notificationsettings NotificationSettings `json:"notificationsettings"`
    Privacysettings PrivacySettings `json:"privacysettings"`
}

type UserUpdate struct {
    Username string `json:"username" validate:"omitempty,alphanum,min=3,max=20"`
    Firstname string `json:"firstname" validate:"omitempty,alpha,min=2,max=20"`
    Lastname string `json:"lastname" validate:"omitempty,alpha,min=2,max=20"`
    Email string `json:"email" validate:"omitempty,email"`
    Password string `json:"password" validate:"omitempty,printascii,min=8,max=30"`
    Notificationsettings NotificationSettings `json:"notificationsettings" validate:"omitempty"`
    Privacysettings PrivacySettings `json:"privacysettings" validate:"omitempty"`
}

type SearchUserResult struct {
    ID primitive.ObjectID `json:"ID"`
    Username string `json:"username"`
    Firstname string `json:"firstname"`
    Lastname string `json:"lastname"`
}

type SearchUserCredentials struct {
    Query string `json:"query" binding:"required" validate:"alphanum"`
}

type NotificationSettings struct {
    Email string `json:"email" validate:"omitempty,oneof=allowed not-allowed"`
    Inapp string `json:"inapp" validate:"omitempty,oneof=allowed not-allowed"`
}

type PrivacySettings struct {
    Profile string `json:"profile" validate:"omitempty,oneof=public private friends-only"`
    Schedule string `json:"schedule" validate:"omitempty,oneof=public private friends-only"`
}

type PendingUser struct {
    Userid primitive.ObjectID
}

type LoginCredentials struct {
    Username string `json:"username" validate:"omitempty,alphanum"`
    Password string `json:"password" binding:"required" validate:"printascii"`
    Email string `json:"email" validate:"omitempty,email"`
}

type EventItem struct {
    Createdby *primitive.ObjectID
    Creatorstatus string `json:"creatorstatus" validate:"omitempty,oneof=going not-going invited interested"`
    Startdate string `json:"startdate" binding:"required"`
    Enddate string `json:"enddate" binding:"required"`
    Title string `json:"title" binding:"required" validate:"printascii,max=30"`
    Description string `json:"description" validate:"omitempty,printascii,max=2000"`
    Expirydate string `json:"expirydate"`
    Eventmembers string `json:"eventmembers" validate:"omitempty"`
    Iscobalt int `json:"iscobalt"`
}

type EventItemUpdate struct {
    Startdate string `json:"startdate"`
    Enddate string `json:"enddate"`
    Title string `json:"title" validate:"omitempty,printascii,max=30"`
    Description string `json:"description" validate:"omitempty,printascii,max=2000"`
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
    Iscobalt int `json:"iscobalt"`
}

type UpdateEventStatusCredentials struct {
    Status string `json:"status" binding:"required" validate:"oneof=going not-going invited interested"`
}

type EventMember struct {
    Userid string `json:"userid" binding:"required"`
    Status string `json:"status" binding:"required" validate:"omitempty,oneof=going not-going invited interested"`
}

type EventMemberDB struct {
    Userid primitive.ObjectID `json:"userid" binding:"required"`
    Status string `json:"status" binding:"required"`
}

type UserIDStruct struct {
    Userid string `json:"userid" binding:"required"`
}

type FriendStruct struct {
    ID primitive.ObjectID
    Userid string
}

type MutualFriend struct {
    Userid primitive.ObjectID `json:"userid"`
    Count int `json:"count"`
}

type ScheduleFriend struct {
    Userid primitive.ObjectID `json:"userid"`
    Count int `json:"count"`
    Courses []string `json:"courses"`
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
    Creatorrole string `json:"creatorrole" validate:"eq=admin"`
    Name string `json:"name" binding:"required" validate:"printascii,max=30"`
    About string `json:"about" validate:"omitempty,printascii,max=2000"`
    Visibility string `json:"visibility" binding:"required" validate:"oneof=public private"`
    Groupmembers []GroupMember `json:"groupmembers" validate:"omitempty"`
}

type GroupUpdate struct {
    Name string `json:"name" validate:"omitempty,printascii,max=30"`
    About string `json:"about" validate:"omitempty,printascii,max=2000"`
    Visibility string `json:"visibility" validate:"omitempty,oneof=public private"`
}

type GroupMember struct {
    Userid primitive.ObjectID `json:"userid" binding:"required"`
    Role string `json:"role" binding:"required" validate:"omitempty,oneof=invited member"`
}


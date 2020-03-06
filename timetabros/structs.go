package main

import (
    "time"

    "go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
    Username string `json:"username" binding:"required"`
    Firstname string `json:"firstname" binding:"required"`
    Lastname string `json:"lastname" binding:"required"`
    Email string `json:"email" binding:"required"`
    Password string `json:"password" binding:"required"`
    Verified int
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

type EventItemDB struct {
    Createdby *primitive.ObjectID `json:"createdby" binding:"required"`
    Creatorstatus string `json:"creatorstatus"`
    Startdate time.Time `json:"startdate" binding:"required"`
    Enddate time.Time `json:"enddate" binding:"required"`
    Title string `json:"title" binding:"required"`
    Description string `json:"description"`
    Expirydate time.Time `json:"expirydate"`
    Eventmembers []EventMemberDB `json:"eventmembers"`
}

type EventMember struct {
    Userid string `json:"userid" binding:"required"`
    Status string `json:"status" binding:"required"`
}

type EventMemberDB struct {
    Userid primitive.ObjectID `json:"userid" binding:"required"`
    Status string `json:"status" binding:"required"`
}


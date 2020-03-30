package main

import (
    "context"
    "encoding/json"
    "net/http"
    "net/smtp"

    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"

    "github.com/gin-gonic/gin"

    "golang.org/x/crypto/bcrypt"
)

// signup api
// curl -X POST -H "Content-Type: application/json" -d '{"username":"SnoopySnipe","password":"snoopy","firstname":"Andrew","lastname":"Leung","email":"andrewleung.41898@outlook.com"}' localhost:3001/signup
func SignUp(c *gin.Context) {
    // get data from request body and store into user type
    var user User
    if err := c.ShouldBindJSON(&user); err != nil {
    	c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
    // verify inputs
    if errs := validate.Struct(user); errs != nil {
	    c.JSON(http.StatusBadRequest, gin.H{"error": errs.Error()})
		return
    }
    // check if user already exists
    var existingUser User
    err := users.FindOne(context.TODO(), bson.M{"username": user.Username}).Decode(&existingUser)
    if err == nil {
        c.JSON(http.StatusConflict, gin.H{"error": "Username " + existingUser.Username + " already exists"})
    	return
    }
    err = users.FindOne(context.TODO(), bson.M{"email": user.Email}).Decode(&existingUser)
    if err == nil {
        c.JSON(http.StatusConflict, gin.H{"error": "Email " + existingUser.Email + " is already in use"})
	    return
    }
    // create salted hash and store it instead of password in clear
    hash, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	    return
    }
    user.Password = string(hash)
    // insert user into db
    user.Verified = 0
    user.Notificationsettings = NotificationSettings{Email:"allowed",Inapp:"allowed"}
    user.Privacysettings = PrivacySettings{Profile:"public",Schedule:"public"}
    insertedUser, err := users.InsertOne(context.TODO(), user)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	    return
    }
    // insert pending user into db
    var pendingUser PendingUser
    pendingUser.Userid = insertedUser.InsertedID.(primitive.ObjectID)
    insertedPendingUser, err := pendingUsers.InsertOne(context.TODO(), pendingUser)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }



    path := "/verify/" + insertedPendingUser.InsertedID.(primitive.ObjectID).Hex()
    // send email
    to := []string{user.Email}
    msg := []byte("To: " + user.Email + "\r\n" +
        "Subject: TimetaBros User SignUp\r\n" +
		"\r\n" +
		"You signed up for TimetaBros, please click " + site + path + " to verify your email.\r\n")
    err = smtp.SendMail(email_setup.Host + ":" + email_setup.Port, auth, email_setup.Address, to, msg)
	if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}



    // send back response with user data and token
    c.JSON(http.StatusOK, gin.H{
        "_id": insertedUser.InsertedID,
        "username": user.Username,
        "firstname": user.Firstname,
        "lastname": user.Lastname,
        "email": user.Email,
        "token": insertedPendingUser.InsertedID,
    })
}

// verify api
// curl -X GET localhost:3001/verify/token
func Verify(c *gin.Context) {
    // get token and check that its valid
    token := c.Param("token")
    tokenObject, err := primitive.ObjectIDFromHex(token)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token " + token})
		return
    }
    // find the user that the token belongs to  
    var pendingUser PendingUser
    err = pendingUsers.FindOne(context.TODO(), bson.M{"_id": tokenObject}).Decode(&pendingUser)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Token " + token + " not found"})
	    return
    }
    var user User
    err = users.FindOne(context.TODO(), bson.M{"_id": pendingUser.Userid}).Decode(&user)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User " + pendingUser.Userid.String() + " not found"})
		return
    }
    // remove the pending user record
    _, err = pendingUsers.DeleteOne(context.TODO(), bson.M{"_id": tokenObject})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    // update the user to verified
    _, err = users.UpdateOne(context.TODO(), bson.M{"_id": pendingUser.Userid}, bson.M{"$set": bson.M{"verified": 1}})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    // send back response with user data
    c.JSON(http.StatusOK, gin.H{
        "_id": pendingUser.Userid,
        "username": user.Username,
        "firstname": user.Firstname,
        "lastname": user.Lastname,
        "email": user.Email,
    })
}

// signin api
// curl -c cookie.txt -X POST -H "Content-Type: application/json" -d '{"username":"SnoopySnipe","password":"snoopy"}' localhost:3001/signin
func SignIn(c *gin.Context) {
    // get credentials
    byte_data, err := c.GetRawData()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    data := &LoginCredentials{}
    err = json.Unmarshal(byte_data, data)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	    return
    }
    username := data.Username
    password := data.Password
    email := data.Email
    if (username == "" && email == "") || password == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Missing arguments"})
		return
    }
    // verify inputs
    if errs := validate.Struct(data); errs != nil {
	    c.JSON(http.StatusUnauthorized, gin.H{"error": errs.Error()})
		return
    }
    // find user in db
    var user User
    var filter bson.M
    if username != "" {
        filter = bson.M{"username": username}
    } else if email != "" {
        filter = bson.M{"email": email}
    }
    err = users.FindOne(context.TODO(), filter).Decode(&user)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Access denied"})
		return
    }
    user_raw, err := users.FindOne(context.TODO(), filter).DecodeBytes()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    // compare passwords
    err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Access denied"})
		return
    }
    // check if verified
    if user.Verified == 0 {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Access denied"})
		return
    }
    // get session
    session, err := store.Get(c.Request, "session")
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    // write user id to session
    session.Values["_id"] = user_raw.Lookup("_id").ObjectID()
    err = session.Save(c.Request, c.Writer)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    // send response
    c.JSON(http.StatusOK, gin.H{
        "_id": user_raw.Lookup("_id").ObjectID(),
        "username": user.Username,
        "firstname": user.Firstname,
        "lastname": user.Lastname,
        "email": user.Email,
    })
}

// signout api
// curl -b cookie.txt -c cookie.txt -X GET localhost:3001/signout
func SignOut(c *gin.Context) {
    // get session
    session, err := store.Get(c.Request, "session")
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    // check if already signed out
    if session.Values["_id"] == nil {
        c.JSON(http.StatusOK, gin.H{
            "message": "Not signed in",
        })
        return
    }
    // remove user id from session
    session.Values["_id"] = nil
    err = session.Save(c.Request, c.Writer)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    // send response
    c.JSON(http.StatusOK, gin.H{
        "message": "Successfully signed out",
    })
}

// get user details api
// curl -b cookie.txt -X GET localhost:3001/api/users/id
func GetUserDetails(c *gin.Context) {
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
    // send response
    c.JSON(http.StatusOK, gin.H{
        "_id": id,
        "username": user.Username,
        "firstname": user.Firstname,
        "lastname": user.Lastname,
        "email": user.Email,
        "notificationsettings": user.Notificationsettings,
        "privacysettings": user.Privacysettings,
    })
}

// update user details api
// curl -b cookie.txt -c cookie.txt -X PATCH -H "Content-Type: application/json" -d @data.txt localhost:3001/api/users
func UpdateUserDetails(c *gin.Context) {
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
    // get update credentials
    var updatedUser UserUpdate
    if err = c.ShouldBindJSON(&updatedUser); err != nil {
    	c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
    // verify inputs
    if errs := validate.Struct(updatedUser); errs != nil {
	    c.JSON(http.StatusBadRequest, gin.H{"error": errs.Error()})
		return
    }
    // create salted hash and store it instead of password in clear
    if updatedUser.Password != "" {
        hash, err := bcrypt.GenerateFromPassword([]byte(updatedUser.Password), bcrypt.DefaultCost)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	        return
        }
        updatedUser.Password = string(hash)
        user.Password = updatedUser.Password
    }
    // check if user already exists
    var existingUser User
    if updatedUser.Username != "" {
        if updatedUser.Username != user.Username {
            err = users.FindOne(context.TODO(), bson.M{"username": updatedUser.Username}).Decode(&existingUser)
            if err == nil {
                c.JSON(http.StatusConflict, gin.H{"error": "Username " + existingUser.Username + " already exists"})
            	return
            }
            user.Username = updatedUser.Username
        }
    }
    var token primitive.ObjectID
    if updatedUser.Email != "" {
        if updatedUser.Email != user.Email {
            err = users.FindOne(context.TODO(), bson.M{"email": updatedUser.Email}).Decode(&existingUser)
            if err == nil {
                c.JSON(http.StatusConflict, gin.H{"error": "Email " + existingUser.Email + " is already in use"})
	            return
            }
            user.Email = updatedUser.Email
            user.Verified = 0
            // insert pending user into db
            var pendingUser PendingUser
            pendingUser.Userid = id
            insertedPendingUser, err := pendingUsers.InsertOne(context.TODO(), pendingUser)
            if err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		        return
            }
            token = insertedPendingUser.InsertedID.(primitive.ObjectID)
            // remove user id from session
            session.Values["_id"] = nil
            err = session.Save(c.Request, c.Writer)
            if err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		        return
            }


            path := "/verify/" + token.Hex()
            // send email
            to := []string{user.Email}
            msg := []byte("To: " + user.Email + "\r\n" +
		            "Subject: TimetaBros User Email Updated\r\n" +
		            "\r\n" +
		            "Your email was updated, please click " + site + path + " to verify.\r\n")
            err = smtp.SendMail(email_setup.Host + ":" + email_setup.Port, auth, email_setup.Address, to, msg)
	        if err != nil {
		        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		        return
	        }



        }
    }
    if updatedUser.Firstname != "" {
        user.Firstname = updatedUser.Firstname
    }
    if updatedUser.Lastname != "" {
        user.Lastname = updatedUser.Lastname
    }
    if updatedUser.Notificationsettings.Email != "" &&  updatedUser.Notificationsettings.Inapp != "" {
        user.Notificationsettings = updatedUser.Notificationsettings
    }
    if updatedUser.Privacysettings.Profile != "" &&  updatedUser.Privacysettings.Schedule != ""  {
        user.Privacysettings = updatedUser.Privacysettings
    }
    // save user into db
    _, err = users.UpdateOne(context.TODO(), bson.M{"_id": id}, bson.M{"$set": user})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	    return
    }
    // send response
    c.JSON(http.StatusOK, gin.H{
        "_id": id,
        "username": user.Username,
        "firstname": user.Firstname,
        "lastname": user.Lastname,
        "email": user.Email,
        "notificationsettings": user.Notificationsettings,
        "privacysettings": user.Privacysettings,
        "token": token,
    })
}

// search users api
// curl -b cookie.txt -X GET -H "Content-Type: application/json" -d '{"query":"alex rhyme jeffrey andrew leung snoopysnipe"}' localhost:3001/api/users
func SearchUsers(c *gin.Context) {
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
    // get search query
    byte_data, err := c.GetRawData()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    data := &SearchUserCredentials{}
    err = json.Unmarshal(byte_data, data)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	    return
    }
    query := data.Query
    // verify inputs
    if errs := validate.Struct(data); errs != nil {
	    c.JSON(http.StatusBadRequest, gin.H{"error": errs.Error()})
		return
    }
    // search users
    searchResults, err := userFind(bson.M{"$text": bson.M{"$search": query,},})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
    }
    // send response
    c.JSON(http.StatusOK, searchResults)
}



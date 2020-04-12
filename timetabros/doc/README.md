# TimetaBros REST API Documentation

## User API

### Sign Up

- Description: Create a TimetaBros account
- Request: `POST /signup`
    - content-type: `application/json`
    - body: object
        - username: (string) your username
        - password: (string) your password
        - firstname: (string) your first name
        - lastname: (string) your last name
        - email: (string) your email
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) One or more required fields is missing
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) One or more fields is formatted incorrectly
- Response: 409
    - content-type: `application/json`
    - body: object
        - error: (string) Username already exists
- Response: 409
    - content-type: `application/json`
    - body: object
        - error: (string) Email is already in use
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: object
        - message: (string) Successfully signed up

```
curl -X POST -H "Content-Type: application/json" -d '{"username":"username","password":"password","firstname":"Fname","lastname":"Lname","email":"email@example.com"}' localhost:3001/signup
```

### Verify

- Description: Verify the new email address
- Request: `GET /verify/:token`
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Invalid token
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) Token not found
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) User not found
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 302

```
curl -X GET localhost:3001/verify/token
```

### Sign In

- Description: Sign in to TimetaBros
- Request: `POST /signin`
    - content-type: `application/json`
    - body: object
        - username: (string) your username
        - password: (string) your password
        - email: (string) your email
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Missing arguments
- Response: 401
    - content-type: `application/json`
    - body: object
        - error: (string) Access denied
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: object
        - _id: (string) your id
        - username: (string) your username
        - firstname: (string) your first name
        - lastname: (string) your last name
        - email: (string) your email
        - notificationsettings: (string) your notification settings
        - privacysettings: (string) your privacy settings

```
curl -c cookie.txt -X POST -H "Content-Type: application/json" -d '{"username":"username","password":"password"}' localhost:3001/signin
```

### Sign Out

- Description: Sign out of TimetaBros
- Request: `GET /signout`
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: object
        - message: (string) Not signed in
- Response: 200
    - content-type: `application/json`
    - body: object
        - message: (string) Successfully signed out

```
curl -b cookie.txt -c cookie.txt -X GET localhost:3001/signout
```

### Request Password Reset

- Description: Request to reset your TimetaBros account password
- Request: `POST /reset`
    - content-type: `application/json`
    - body: object
        - email: (string) your email
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Missing arguments
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Incorrect format
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) Email is not registered with TimetaBros
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: object
        - message: (string) Successfully sent email

```
curl -X POST -H "Content-Type: application/json" -d '{"email":"email@example.com"}' localhost:3001/reset
```

### Reset Password

- Description: Reset your TimetaBros account password
- Request: `PATCH /reset/:token`
    - content-type: `application/json`
    - body: object
        - password: (string) your password
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Invalid token
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Missing arguments
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Incorrect format
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) Token not found
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) User not found
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: object
        - message: (string) Successfully updated password

```
curl -X PATCH -H "Content-Type: application/json" -d '{"password":"password"}' localhost:3001/reset/token
```

### Read

- Description: Get a TimetaBros account details
- Request: `GET /api/users/:id`
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Invalid id
- Response: 401
    - content-type: `application/json`
    - body: object
        - error: (string) Access denied
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) User not found
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: object
        - _id: (string) their id
        - username: (string) their username
        - firstname: (string) their first name
        - lastname: (string) their last name
        - email: (string) their email
        - notificationsettings: (string) their notification settings
        - privacysettings: (string) their privacy settings

```
curl -b cookie.txt -X GET localhost:3001/api/users/id
```

- Description: Search for TimetaBros accounts
- Request: `GET /api/users?q=fname+lname+username`
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Incorrect format
- Response: 401
    - content-type: `application/json`
    - body: object
        - error: (string) Access denied
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: list of objects
        - ID: (string) their id
        - username: (string) their username
        - firstname: (string) their first name
        - lastname: (string) their last name

```
curl -b cookie.txt -X GET localhost:3001/api/users?q=fname+lname+username
```

- Description: Get a TimetaBros account profile picture
- Request: `GET /api/users/:id/pfp`
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Invalid id
- Response: 401
    - content-type: `application/json`
    - body: object
        - error: (string) Access denied
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) User not found
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) User has no profile picture
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `image/*`

```
curl -b cookie.txt -X GET localhost:3001/api/users/id/pfp
```

### Update

- Description: Update your TimetaBros account details
- Request: `PATCH /api/users
    - content-type: `multipart/form-data`
    - body: object
        - username: (string) your username
        - firstname: (string) your first name
        - lastname: (string) your last name
        - email: (string) your email
        - password: (string) your password
        - notificationsettings: (string) your notification settings
        - privacysettings: (string) your privacy settings
        - profilepicture: (bytes) your profile picture
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Invalid id
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) One or more required fields is missing
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) One or more fields is formatted incorrectly
- Response: 401
    - content-type: `application/json`
    - body: object
        - error: (string) Access denied
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) User not found
- Response: 409
    - content-type: `application/json`
    - body: object
        - error: (string) Username already exists
- Response: 409
    - content-type: `application/json`
    - body: object
        - error: (string) Email is already in use
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: object
        - _id: (string) your id
        - username: (string) your username
        - firstname: (string) your first name
        - lastname: (string) your last name
        - email: (string) your email
        - notificationsettings: (string) your notification settings
        - privacysettings: (string) your privacy settings

```
curl -b cookie.txt -c cookie.txt -X PATCH -H "Content-Type: multipart/form-data" -F profilepicture=@unknown.png -F username=username localhost:3001/api/users
```

## Schedule API

### Create

- Description: Create an item on your schedule
- Request: `POST /api/event_items`
    - content-type: `application/json`
    - body: object
        - creatorstatus: (string) the event status of the creator
        - startdate: (string) the start date of the item
        - enddate: (string) the end date of the item
        - title: (string) the title of the item
        - description: (string) the description of the item
        - expirydate: (string) the expiry date of the item
        - eventmembers: (string) the initial list of users to invite to the event
        - iscobalt: (int) a flag that indicates if the item is a course
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) One or more required fields is missing
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) One or more fields is formatted incorrectly
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Event end date must be after start date
- Response: 401
    - content-type: `application/json`
    - body: object
        - error: (string) Access denied
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: object
        - _id: (string) the id of the item
        - createdby: (string) the item's creator
        - creatorstatus: (string) the event status of the creator
        - startdate: (string) the start date of the item
        - enddate: (string) the end date of the item
        - title: (string) the title of the item
        - description: (string) the description of the item
        - expirydate: (string) the expiry date of the item
        - eventmembers: (string) the list of users associated to the event
        - iscobalt: (int) a flag that indicates if the item is a course

```
curl -b cookie.txt -X POST -H "Content-Type: application/json" -d '{"title":"event","startdate":"2020-04-20T16:20:00.000Z","enddate":"2020-04-20T16:50:00.000Z"}' localhost:3001/api/event_items
```

- Description: Invite a user to an event
- Request: `POST /api/event_items/:id/members`
    - content-type: `application/json`
    - body: object
        - userid: (string) the user to invite
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Missing arguments
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Invalid id
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Cannot send event request to self
- Response: 401
    - content-type: `application/json`
    - body: object
        - error: (string) Access denied
- Response: 403
    - content-type: `application/json`
    - body: object
        - error: (string) User is not in the event
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) User not found
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) Event not found
- Response: 409
    - content-type: `application/json`
    - body: object
        - error: (string) User is already in event
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: object
        - message: (string) Successfully sent invite

```
curl -b cookie.txt -X POST -H "Content-Type: application/json" -d '{"userid":"userid"}' localhost:3001/api/event_items/id/members
```

### Read

- Description: Get a schedule item's details
- Request: `GET /api/event_items/:id`
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Invalid id
- Response: 401
    - content-type: `application/json`
    - body: object
        - error: (string) Access denied
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) Event not found
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: object
        - _id: (string) the id of the item
        - createdby: (string) the item's creator
        - creatorstatus: (string) the event status of the creator
        - startdate: (string) the start date of the item
        - enddate: (string) the end date of the item
        - title: (string) the title of the item
        - description: (string) the description of the item
        - expirydate: (string) the expiry date of the item
        - eventmembers: (string) the list of users associated to the event
        - iscobalt: (int) a flag that indicates if the item is a course

```
curl -b cookie.txt -X GET localhost:3001/api/event_items/id
```

- Description: Get all schedule items related to a particular user
- Request: `GET /api/users/:id/event_items`
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Invalid id
- Response: 401
    - content-type: `application/json`
    - body: object
        - error: (string) Access denied
- Response: 403
    - content-type: `application/json`
    - body: object
        - error: (string) Forbidden
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) User not found
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: object
        - _id: (string) the id of the user
        - scheduleitems: (string) the user's recurring schedule items
        - courses: (string) the user's courses
        - tempscheduleitems: (string) the user's temporary schedule items
        - eventowneritems: (string) the user's events that they created
        - eventmemberitems: (string) the user's events that they are a part of
        - eventrequestitems: (string) the user's events that they were invited to

```
curl -b cookie.txt -X GET localhost:3001/api/users/id/event_items
```

### Update

- Description: Update a schedule item's details
- Request: `PATCH /api/event_items/:id`
    - content-type: `application/json`
    - body: object
        - startdate: (string) the start date of the item
        - enddate: (string) the end date of the item
        - title: (string) the title of the item
        - description: (string) the description of the item
        - expirydate: (string) the expiry date of the item
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Invalid id
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) One or more required fields is missing
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) One or more fields is formatted incorrectly
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Event end date must be after start date
- Response: 401
    - content-type: `application/json`
    - body: object
        - error: (string) Access denied
- Response: 403
    - content-type: `application/json`
    - body: object
        - error: (string) Forbidden
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) Event not found
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: object
        - _id: (string) the id of the item
        - createdby: (string) the item's creator
        - creatorstatus: (string) the event status of the creator
        - startdate: (string) the start date of the item
        - enddate: (string) the end date of the item
        - title: (string) the title of the item
        - description: (string) the description of the item
        - expirydate: (string) the expiry date of the item
        - eventmembers: (string) the list of users associated to the event
        - iscobalt: (int) a flag that indicates if the item is a course

```
curl -b cookie.txt -X PATCH -H "Content-Type: application/json" -d '{"title":"event"}' localhost:3001/api/event_items/id
```

- Description: Update your status to an event
- Request: `PATCH /api/event_items/:id/members`
    - content-type: `application/json`
    - body: object
        - status: (string) your status
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Missing arguments
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Incorrect format
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Invalid id
- Response: 401
    - content-type: `application/json`
    - body: object
        - error: (string) Access denied
- Response: 403
    - content-type: `application/json`
    - body: object
        - error: (string) User is not invited to event
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) Event not found
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: object
        - message: (string) Successfully updated status

```
curl -b cookie.txt -X PATCH -H "Content-Type: application/json" -d '{"status":"going"}' localhost:3001/api/event_items/id/members
```

### Delete

- Description: Delete a schedule item
- Request: `DELETE /api/event_items/:id`
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Invalid id
- Response: 401
    - content-type: `application/json`
    - body: object
        - error: (string) Access denied
- Response: 403
    - content-type: `application/json`
    - body: object
        - error: (string) Forbidden
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) Event not found
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: object
        - _id: (string) the id of the item
        - createdby: (string) the item's creator
        - creatorstatus: (string) the event status of the creator
        - startdate: (string) the start date of the item
        - enddate: (string) the end date of the item
        - title: (string) the title of the item
        - description: (string) the description of the item
        - expirydate: (string) the expiry date of the item
        - eventmembers: (string) the list of users associated to the event
        - iscobalt: (int) a flag that indicates if the item is a course

```
curl -b cookie.txt -X DELETE localhost:3001/api/event_items/id
```

- Description: Delete a user on the event member list
- Request: `DELETE /api/event_items/:id/members`
    - content-type: `application/json`
    - body: object
        - userid: (string) the user to delete
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Missing arguments
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Invalid id
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Creator cannot delete self from event
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) User is not in event
- Response: 401
    - content-type: `application/json`
    - body: object
        - error: (string) Access denied
- Response: 403
    - content-type: `application/json`
    - body: object
        - error: (string) Members can only delete self from event
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) Event not found
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) User not found
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: object
        - message: (string) Successfully removed from event

```
curl -b cookie.txt -X DELETE -H "Content-Type: application/json" -d '{"userid":"userid"}' localhost:3001/api/event_items/id/members
```

## Friend API

### Create

- Description: Send a friend request
- Request: `POST /api/friends`
    - content-type: `application/json`
    - body: object
        - userid: (string) the user to add as a friend
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Missing arguments
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Invalid id
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Cannot send friend request to self
- Response: 401
    - content-type: `application/json`
    - body: object
        - error: (string) Access denied
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) User not found
- Response: 409
    - content-type: `application/json`
    - body: object
        - error: (string) Already friends with user
- Response: 409
    - content-type: `application/json`
    - body: object
        - error: (string) There is already a pending friend request
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: object
        - message: (string) Successfully sent friend request

```
curl -b cookie.txt -X POST -H "Content-Type: application/json" -d '{"userid":"userid"}' localhost:3001/api/friends
```

### Read

- Description: Get a user's friend list
- Request: `GET /api/users/:id/friends`
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Invalid id
- Response: 401
    - content-type: `application/json`
    - body: object
        - error: (string) Access denied
- Response: 403
    - content-type: `application/json`
    - body: object
        - error: (string) Forbidden
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) User not found
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: object
        - _id: (string) the user's id
        - friends: (string) the user's friends
        - sentfriendrequests: (string) the pending friend requests the user has sent
        - receivedfriendrequests: (string) the pending friend requests the user has received

```
curl -b cookie.txt -X GET localhost:3001/api/users/id/friends
```

- Description: Get your top 10 suggested friends based on mutual friends
- Request: `GET /api/mutual_friend_recommendations`
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Invalid id
- Response: 401
    - content-type: `application/json`
    - body: object
        - error: (string) Access denied
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) User not found
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: object
        - _id: (string) the user's id
        - mutualfriends: (string) the user's top 10 suggested friends based on mutual friends

```
curl -b cookie.txt -X GET localhost:3001/api/mutual_friend_recommendations
```

- Description: Get your top 10 suggested friends based on course similarity
- Request: `GET /api/schedule_friend_recommendations`
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Invalid id
- Response: 401
    - content-type: `application/json`
    - body: object
        - error: (string) Access denied
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) User not found
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: object
        - _id: (string) the user's id
        - schedulefriends: (string) the user's top 10 suggested friends based on course similarity

```
curl -b cookie.txt -X GET localhost:3001/api/schedule_friend_recommendations
```

### Update

- Description: Accept a friend request
- Request: `PATCH /api/friends/:token`
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Invalid id
- Response: 401
    - content-type: `application/json`
    - body: object
        - error: (string) Access denied
- Response: 403
    - content-type: `application/json`
    - body: object
        - error: (string) Forbidden
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) Token not found
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: object
        - message: (string) Successfully accepted friend request

```
curl -b cookie.txt -X PATCH localhost:3001/api/friends/token
```

### Delete

- Description: Remove a friend connection
- Request: `DELETE /api/friends`
    - content-type: `application/json`
    - body: object
        - userid: (string) the friend to remove
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Missing arguments
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Invalid id
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Cannot delete self from friends
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Not friends with user
- Response: 401
    - content-type: `application/json`
    - body: object
        - error: (string) Access denied
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) User not found
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: object
        - message: (string) Successfully removed friend

```
curl -b cookie.txt -X DELETE -H "Content-Type: application/json" -d '{"userid":"userid"}' localhost:3001/api/friends
```

## Group API

### Create

- Description: Create a group
- Request: `POST /api/groups`
    - content-type: `application/json`
    - body: object
        - name: (string) the name of the group
        - about: (string) about the group
        - visibility: (string) the visibility of the group
        - groupmembers: (string) the initial list of users to invite to the group
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) One or more required fields is missing
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) One or more fields is formatted incorrectly
- Response: 401
    - content-type: `application/json`
    - body: object
        - error: (string) Access denied
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: object
        - _id: (string) the id of the group
        - createdby: (string) the group's creator
        - creatorrole: (string) the role of the creator
        - name: (string) the name of the group
        - about: (string) about the group
        - visibility: (string) the visibility of the group
        - groupmembers: (string) the list of users associated to the group

```
curl -b cookie.txt -X POST -H "Content-Type: application/json" -d '{"name":"group","visibility":"public"}' localhost:3001/api/groups
```

- Description: Invite a user to a group
- Request: `POST /api/groups/:id/members`
    - content-type: `application/json`
    - body: object
        - userid: (string) the user to invite
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Missing arguments
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Invalid id
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Cannot send group request to self
- Response: 401
    - content-type: `application/json`
    - body: object
        - error: (string) Access denied
- Response: 403
    - content-type: `application/json`
    - body: object
        - error: (string) User is not in the group
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) User not found
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) Group not found
- Response: 409
    - content-type: `application/json`
    - body: object
        - error: (string) User is already in group
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: object
        - message: (string) Successfully sent invite

```
curl -b cookie.txt -X POST -H "Content-Type: application/json" -d '{"userid":"userid"}' localhost:3001/api/groups/id/members
```

### Read

- Description: Get a group's details
- Request: `GET /api/groups/:id`
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Invalid id
- Response: 401
    - content-type: `application/json`
    - body: object
        - error: (string) Access denied
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) Group not found
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: object
        - _id: (string) the id of the group
        - createdby: (string) the group's creator
        - creatorrole: (string) the role of the creator
        - name: (string) the name of the group
        - about: (string) about the group
        - visibility: (string) the visibility of the group
        - groupmembers: (string) the list of users associated to the group

```
curl -b cookie.txt -X GET localhost:3001/api/groups/id
```

- Description: Get all groups related to a particular user
- Request: `GET /api/users/:id/groups`
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Invalid id
- Response: 401
    - content-type: `application/json`
    - body: object
        - error: (string) Access denied
- Response: 403
    - content-type: `application/json`
    - body: object
        - error: (string) Forbidden
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) User not found
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: object
        - _id: (string) the id of the user
        - userownedgroups: (string) the groups the user owns
        - usermembergroups: (string) the groups the user is a member of
        - userrequestgroups: (string) the groups the user has been invited to

```
curl -b cookie.txt -X GET localhost:3001/api/users/id/groups
```

### Update

- Description: Update a groups's details
- Request: `PATCH /api/groups/:id`
    - content-type: `application/json`
    - body: object
        - name: (string) the name of the group
        - about: (string) about the group
        - visibility: (string) the visibility of the group
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Invalid id
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) One or more required fields is missing
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) One or more fields is formatted incorrectly
- Response: 401
    - content-type: `application/json`
    - body: object
        - error: (string) Access denied
- Response: 403
    - content-type: `application/json`
    - body: object
        - error: (string) Forbidden
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) Group not found
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: object
        - _id: (string) the id of the group
        - createdby: (string) the group's creator
        - creatorrole: (string) the role of the creator
        - name: (string) the name of the group
        - about: (string) about the group
        - visibility: (string) the visibility of the group
        - groupmembers: (string) the list of users associated to the group

```
curl -b cookie.txt -X PATCH -H "Content-Type: application/json" -d '{"name":"group"}' localhost:3001/api/groups/id
```

- Description: Accept a group invite
- Request: `PATCH /api/groups/:id/members`
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Invalid id
- Response: 401
    - content-type: `application/json`
    - body: object
        - error: (string) Access denied
- Response: 403
    - content-type: `application/json`
    - body: object
        - error: (string) User is not invited to group
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) Group not found
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: object
        - message: (string) Successfully joined group

```
curl -b cookie.txt -X PATCH localhost:3001/api/groups/id/members
```

### Delete

- Description: Delete a group
- Request: `DELETE /api/groups/:id`
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Invalid id
- Response: 401
    - content-type: `application/json`
    - body: object
        - error: (string) Access denied
- Response: 403
    - content-type: `application/json`
    - body: object
        - error: (string) Forbidden
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) Group not found
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: object
        - _id: (string) the id of the group
        - createdby: (string) the group's creator
        - creatorrole: (string) the role of the creator
        - name: (string) the name of the group
        - about: (string) about the group
        - visibility: (string) the visibility of the group
        - groupmembers: (string) the list of users associated to the group

```
curl -b cookie.txt -X DELETE localhost:3001/api/groups/id
```

- Description: Delete a user on the group member list
- Request: `DELETE /api/groups/:id/members`
    - content-type: `application/json`
    - body: object
        - userid: (string) the user to delete
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Missing arguments
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Invalid id
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) Admin cannot delete self from event
- Response: 400
    - content-type: `application/json`
    - body: object
        - error: (string) User is not in group
- Response: 401
    - content-type: `application/json`
    - body: object
        - error: (string) Access denied
- Response: 403
    - content-type: `application/json`
    - body: object
        - error: (string) Members can only delete self from group
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) Group not found
- Response: 404
    - content-type: `application/json`
    - body: object
        - error: (string) User not found
- Response: 500
    - content-type: `application/json`
    - body: object
        - error: (string) `General internal server error`
- Response: 200
    - content-type: `application/json`
    - body: object
        - message: (string) Successfully removed from group

```
curl -b cookie.txt -X DELETE -H "Content-Type: application/json" -d '{"userid":"userid"}' localhost:3001/api/groups/id/members
```


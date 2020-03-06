import React from "react";

export default function FriendService(props){
    return(
        <div className="friend">
            <h3>{props.user.firstname} {props.user.lastname}</h3>
            <p>{props.user.username}</p>
        </div>
    )
}
import React from "react";

export default function UserProfile(props){
    return(
        <div className="user">
            <h3>{props.user.firstname} {props.user.lastname}</h3>
            <p>{props.user.username}</p>
        </div>
    )
}
import React from 'react';
import FriendService from "../services/FriendService";


class Friend extends React.Component {
    constructor(){
        super()
        this.state = {friendList: []}
    }

    componentWillMount(){
        // Grab array of friends from api call
        let FL = this.getFriends();
        console.log("FL");
        console.log(FL);
        // Set the state
        this.setState({friendList: FL});
    }

    // Just for testing purposes
    getFriends(){
        let List = []
        for(var i=0; i<5; i++){
            let number = Math.floor(Math.random()*10) + 1;
            let user = {
                username: "test"+number,
                firstname: "firstname"+number,
                lastname: "lastname"+number}
            List.push(user);
        }
        return List;
        
    }

    render() {
        let friendList = this.state.friendList
        console.log("friendList");
        console.log(friendList);
        return(
            <div>
                {friendList.map(friend =>
                    <FriendService key={friend.username} user={friend} />)}
            </div>
        )

    }
}


export default Friend;

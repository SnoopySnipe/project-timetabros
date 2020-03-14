import React from 'react';
import UserProfile from "./components/UserProfile";
import '../styles/pages/Friends.css';
import AddFriendBar from './components/AddFriendBar/AddFriendBar';

class Friends extends React.Component {
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
            <div id="friends">
                <AddFriendBar></AddFriendBar>
                {friendList.map(friend =>
                    <UserProfile key={friend.username} user={friend} />)}
            </div>
        )

    }
}


export default Friends;

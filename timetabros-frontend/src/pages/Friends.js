import React from 'react';
import UserProfile from "./components/UserProfile";
import '../styles/pages/Friends.css';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

class Friends extends React.Component {
    static contextType = AuthContext;

    state = {
        friendList: []
    };

    componentWillMount(){
        // Grab array of friends from api call

        // Swap bottom api call to // localhost:3001/api/users/:id/friends later

        // This is hard coded for now
        axios.get(`http://localhost:3001/api/users/${this.context.authenticatedUser._id}`).then(res => {
            let newFL = this.state.friendList;
            newFL.push(res.data);
            this.setState({friendList: newFL});
        })
        console.log(this.state.friendList);
        // Set the state
    }

    // Just for testing purposes
    // getFriends(){
    //     let List = []
    //     for(var i=0; i<5; i++){
    //         let number = Math.floor(Math.random()*10) + 1;
    //         let user = {
    //             username: "test"+number,
    //             firstname: "firstname"+number,
    //             lastname: "lastname"+number}
    //         List.push(user);
    //     }
    //     return List;
    // }

    addFriend(id){
        console.log(id);
    }

    render() {
        let friendList = this.state.friendList
        console.log("friendList");
        console.log(friendList);
        return(
            <div>
                <div id="friends">
                    {friendList.map(friend =>
                        <div>
                            <UserProfile key={friend.username} user={friend} />
                            <button onClick={() => this.addFriend(friend._id)}>
                                Add
                            </button>
                        </div>
                    )}
                </div>
                
            </div>
        )

    }
}


export default Friends;

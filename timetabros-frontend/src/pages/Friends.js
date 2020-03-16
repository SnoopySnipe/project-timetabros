import React from 'react';
import UserProfile from "./components/UserProfile";
import '../styles/pages/Friends.css';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

class Friends extends React.Component {
    static contextType = AuthContext;

    state = {
        friendList: [],
        query: ""
    };

    componentWillMount(){
        // Grab array of friends from api call

        // Swap bottom api call to // localhost:3001/api/users/:id/friends later

        // Get specific user details
        
        axios.get(`http://localhost:3001/api/users/5e692e2cac7ccf00b9e1d71b`).then(res => {
        //axios.get(`http://localhost:3001/api/users/${this.context.authenticatedUser._id}`).then(res => {
            let newFL = this.state.friendList;
            newFL.push(res.data);
            this.setState({friendList: newFL});
        })
        console.log(this.state.friendList);
        // // Set the state

    }

    addFriend(id){
        console.log(id);
    }

    searchFriend = event => {
        event.preventDefault();
        console.log(this.state);
        let query = {
            "query": this.state.query
        }
        console.log(query);

        // WHAT THE FUCK IS GOING ON?????? this doesnt actually work...
        axios.get(`http://localhost:3001/api/users`, {query: this.state.query})
            .then(res => {
                console.log(res);
            })
    }

    setQuery = event => {
        this.setState({ query: event.target.value});
    }


    render() {
        let friendList = this.state.friendList
        console.log("friendList");
        console.log(friendList);
        return(
            <div>
                <form onSubmit={this.searchFriend}>
                    <input type="text" name="searchQuery" onChange={this.setQuery}/>
                    <button type="submit">Search</button>
                </form>
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

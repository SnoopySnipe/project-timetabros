import React from 'react';
import UserProfile from "./components/UserProfile";
import '../styles/pages/Friends.css';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Container, Grid, List, ListItem, ListItemText, ListItemAvatar, Avatar, ListItemSecondaryAction, IconButton } from '@material-ui/core';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import { sendFriendRequest } from '../services/FriendService';
class Friends extends React.Component {
    static contextType = AuthContext;

    state = {
        searchedUsers: [],
        friendList: [],
        query: ""
    };

    componentWillMount(){
        // Grab array of friends from api call

        // Swap bottom api call to // localhost:3001/api/users/:id/friends later

        // Get specific user details
        
        axios.get(`http://localhost:3001/api/users/5e692e2cac7ccf00b9e1d71b`).then(res => {
        //axios.get(`http://localhost:3001/api/users/${this.context.authenticatedUser._id}`).then(res => {
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

        // WHAT THE FUCK IS GOING ON?????? this doesnt actually work...
        axios.post(`http://localhost:3001/api/users`, {query: this.state.query})
            .then(res => {
                this.setState({searchedUsers: res.data});
                console.log(res);
            })
    }

    setQuery = event => {
        this.setState({ query: event.target.value});
    }

    handleAddUser = userid => {
        sendFriendRequest(userid).then((res)=>{
            console.log(res);
        });
    }

    render() {
        let friendList = this.state.friendList;
        const searchedList = this.state.searchedUsers;
        const listItems = !searchedList ? [] : searchedList.map((user) => (
            <ListItem divider>
                <ListItemAvatar>
                    <Avatar>{user.firstname.charAt(0).toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText 
                    primary={`${user.firstname}  ${user.lastname}`}
                    secondary={user.username}
                >
            
                </ListItemText>
                <ListItemSecondaryAction>
                    <IconButton size="small" aria-label="accept" onClick={()=>this.handleAddUser(user.ID)}>
                      <PersonAddIcon fontSize="small" />
                    </IconButton>
                </ListItemSecondaryAction>
            </ListItem>
        ))
        console.log("friendList");
        console.log(friendList);
        return(
            <Grid container spacing={4} >
                <Grid item xs={12} md={6}>
                    <h1>Find friends</h1>
                    <form onSubmit={this.searchFriend}>
                        <input type="text" name="searchQuery" onChange={this.setQuery}/>
                        <button type="submit">Search</button>
                    </form>
                    <List>
                        {listItems}
                    </List>
                </Grid>
                <Grid item xs={12} md={6}>
                    <h1>Friend list</h1>
                    <List>
                        {/* {listItems} */}
                    </List>
                </Grid>
            </Grid>
            // <div>
            //     <List>
            //         {listItems}
            //     </List>
            //     <form onSubmit={this.searchFriend}>
            //         <input type="text" name="searchQuery" onChange={this.setQuery}/>
            //         <button type="submit">Search</button>
            //     </form>
            //     <div id="friends">
            //         {friendList.map(friend =>
            //             <div>
            //                 <UserProfile key={friend.username} user={friend} />
            //                 <button onClick={() => this.addFriend(friend._id)}>
            //                     Add
            //                 </button>
            //             </div>
            //         )}
            //     </div>
            // </div>
            
        )

    }
}


export default Friends;

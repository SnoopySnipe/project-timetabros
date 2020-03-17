import React from 'react';
import UserProfile from "./components/UserProfile";
import '../styles/pages/Friends.css';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Container, Grid, List, ListItem, ListItemText, ListItemAvatar, Avatar, ListItemSecondaryAction, IconButton } from '@material-ui/core';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import { getFriends, sendFriendRequest } from '../services/FriendService';
import { getUser } from '../services/UserService';
class Friends extends React.Component {
    static contextType = AuthContext;

    constructor(props) {
        super(props);
        this.state = {
            searchedUsers: [],
            friendList: [],
            query: ""
        };
        console.log(this.state);
    }


    componentWillMount(){
        // Grab array of friends from api call

        // Swap bottom api call to // localhost:3001/api/users/:id/friends later

        // Get specific user details
        
        getFriends(this.context.authenticatedUser._id).then(
            (response) => {
                const friendList = !response.data.friends ? [] : response.data.friends.forEach(
                    (item) => {
                        const friendId = this.context.authenticatedUser._id == item.user1 ? item.user2 : item.user1;
                        getUser(friendId).then(
                            (res) => {
                                const user = res.data;
                                console.log(this.state);
                                this.setState(
                                    {
                                        friendList : this.state.friendList.concat([{
                                            id: user._id,
                                            firstName: user.firstname,
                                            lastName: user.lastname,
                                            username: user.username
                                          }])
                                    }
                                )
                             }
                        )
                    }
                );
            }
        )
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
        console.log(friendList);
        console.log(searchedList);
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
                    {!this.state.friendList.some((friend)=>friend.id === user.ID) && 
                    <IconButton size="small" aria-label="accept" onClick={()=>this.handleAddUser(user.ID)}>
                      <PersonAddIcon fontSize="small" />
                    </IconButton>}

                </ListItemSecondaryAction>
            </ListItem>
        ))
        const friends = this.state.friendList;
        const friendItems = !friends ? [] : friends.map((user) => (
            <ListItem button divider>
                <ListItemAvatar>
                    <Avatar>{user.firstName.charAt(0).toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText 
                    primary={`${user.firstName}  ${user.lastName}`}
                    secondary={user.username}
                >
            
                </ListItemText>
            </ListItem>
        ))
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
                        {friendItems}
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

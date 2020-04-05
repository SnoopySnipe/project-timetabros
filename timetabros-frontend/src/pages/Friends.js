import React from 'react';
import Profile from './Profile';
import '../styles/pages/Friends.css';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Grid, List, ListItem, ListItemText, ListItemAvatar, Avatar, ListItemSecondaryAction, IconButton } from '@material-ui/core';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import { getFriends, sendFriendRequest } from '../services/FriendService';
import { getGroups } from '../services/GroupService';
import { getUser } from '../services/UserService';
import { Route } from 'react-router-dom';
import GroupDialog from './components/GroupDialog/GroupDialog';
class Friends extends React.Component {
    static contextType = AuthContext;

    constructor(props) {
        super(props);
        this.state = {
            searchedUsers: [],
            friendList: [],
            sentFriendRequests: [],
            groups: [],
            query: "",
            openGroupDialog: false,
            selectedGroup: null
        };
        console.log(this.state);
    }

    fetchFriends() {
        console.log('!!!!');
        this.setState({friendList: []});
        getFriends(this.context.authenticatedUser._id).then(
            (response) => {
                const sentRequests = response.data.sentfriendrequests;
                this.setState({sentFriendRequests: sentRequests? sentRequests : []});
                if(response.data.friends) response.data.friends.forEach(
                    (item) => {
                        const friendId = item.Userid;
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
        );
    }

    fetchGroups() {
        this.setState({groups: []});
        getGroups(this.context.authenticatedUser._id).then(
            (response) => {
              const ownedGroups = response.data.userownedgroups || [];
              const memberGroups = response.data.usermembergroups || [];
              this.setState({groups: this.state.groups.concat(memberGroups).concat(ownedGroups)});
            }
          )
    }

    componentDidMount(){
        this.fetchFriends();
        this.fetchGroups();
    }

    searchFriend = event => {
        event.preventDefault();
        console.log(this.state);

        axios.get(`http://localhost:3001/api/users`, {params: {q: this.state.query}})
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
            this.fetchFriends();
        });
    }

    handleSelectFriend = userId => {
        this.props.history.push(`/home/profile/${userId}`);
    }

    render() {
        let friendList = this.state.friendList;
        const searchedList = this.state.searchedUsers;
        console.log(friendList);
        console.log(searchedList);
        const listItems = !searchedList ? [] : searchedList.map((user) => (
            <ListItem divider>
                <ListItemAvatar>
                    <Avatar src={`http://localhost:3001/api/users/${user.ID}/pfp`}>{user.firstname.charAt(0).toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText 
                    primary={`${user.firstname}  ${user.lastname}`}
                    secondary={user.username}
                >
            
                </ListItemText>
                <ListItemSecondaryAction>
                    {this.state.sentFriendRequests.some((request)=> request.Userid === user.ID) 
                    ? <div>Pending</div> 
                    : this.state.friendList.some((friend)=>friend.id === user.ID) 
                    ? <div>Friends</div> 
                    : <IconButton size="small" aria-label="accept" onClick={()=>this.handleAddUser(user.ID)}>
                    <PersonAddIcon fontSize="small" />
                    </IconButton>
                    }

                </ListItemSecondaryAction>
            </ListItem>
        ))
        const friends = this.state.friendList;
        const friendItems = !friends ? [] : friends.map((user) => (
            <ListItem button divider onClick={()=>this.handleSelectFriend(user.id)}>
                <ListItemAvatar>
                    <Avatar src={`http://localhost:3001/api/users/${user.id}/pfp`}>{user.firstName.charAt(0).toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText 
                    primary={`${user.firstName}  ${user.lastName}`}
                    secondary={user.username}
                >
            
                </ListItemText>
            </ListItem>
        ))
        const groups = this.state.groups;
        const groupItems = !groups ? [] : groups.map((group) => (
            <ListItem button divider onClick={()=>{this.setState({openGroupDialog: true, selectedGroup: group})}}>
                {/* <ListItemAvatar>
                    <Avatar>{user.firstName.charAt(0).toUpperCase()}</Avatar>
                </ListItemAvatar> */}
                <ListItemText 
                    primary={`${group.name}`}
                    // secondary={user.username}
                >
            
                </ListItemText>
            </ListItem>
        ))
        return(
            <div>
                <GroupDialog open={this.state.openGroupDialog} handleClose={()=>{this.setState({openGroupDialog: false, selectedGroup: null})}} handleGroupUpdate={()=>{this.fetchGroups()}} groupToUpdate={this.state.selectedGroup}></GroupDialog>
                <Grid container spacing={4} >
                    <Grid item xs={12}>
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
                    <Grid item xs={12} md={6}>
                        <h1>Group list                     
                            <IconButton aria-label="accept" onClick={()=>{this.setState({openGroupDialog: true})}}>
                                <GroupAddIcon  />
                            </IconButton>
                        </h1>

                        <List>
                            {groupItems}
                        </List>
                    </Grid>


                </Grid>
            </div>

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

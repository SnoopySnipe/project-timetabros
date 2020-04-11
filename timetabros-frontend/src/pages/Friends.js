import React from 'react';
import '../styles/pages/Friends.css';
import AuthContext from '../context/AuthContext';
import { Grid, List, ListItem, ListItemText, ListItemAvatar, Avatar, ListItemSecondaryAction, IconButton } from '@material-ui/core';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import RemoveIcon from '@material-ui/icons/Remove';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { getFriends, sendFriendRequest, removeFriend, getMutualFriends, getScheduleFriends } from '../services/FriendService';
import { getGroups, removeGroup } from '../services/GroupService';
import { getUser, searchUser} from '../services/UserService';
import GroupDialog from './components/GroupDialog/GroupDialog';
class Friends extends React.Component {
    static contextType = AuthContext;
    suggestMethods = {mutualFriend: 'Suggest by mutual friends', mutualCourse: 'Suggest by mutual courses'};
    constructor(props) {
        super(props);
        this.state = {
            searchedUsers: [],
            friendList: [],
            sentFriendRequests: [],
            receivedFriendRequests: [],
            mutualFriends: [],
            scheduleFriends: [],
            suggestMethod: this.suggestMethods.mutualFriend,
            groups: [],
            query: "",
            openGroupDialog: false,
            selectedGroup: null
        };
    }

    fetchFriends() {
        this.setState({friendList: []});
        getFriends(this.context.authenticatedUser._id).then(
            (response) => {
                const sentRequests = response.data.sentfriendrequests;
                this.setState({sentFriendRequests: sentRequests? sentRequests : []});
                this.setState({receivedFriendRequests: response.data.receivedfriendrequests || []});
                if(response.data.friends) response.data.friends.forEach(
                    (item) => {
                        const friendId = item.Userid;
                        getUser(friendId).then(
                            (res) => {
                                const user = res.data;
                                this.setState(
                                    {
                                        friendList : this.state.friendList.concat([{
                                            id: user._id,
                                            firstName: user.firstname,
                                            lastName: user.lastname,
                                            username: user.username
                                          }])
                                    }
                                );
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

    fetchMutualFriends() {
        getMutualFriends().then(
            (res) => {
                const mutualFriends = res.data.mutualfriends || [];
                const promises = [];
                const mutualCount = [];
                mutualFriends.forEach(
                    (item) => {
                        promises.push(getUser(item.userid));
                        mutualCount.push(item.count);
                    }
                );
                Promise.all(promises).then(
                    (responses) => {
                        let newMutualFriends = [];
                        for(let i = 0; i < promises.length; i++) {
                            const user = responses[i].data;
                            user.mutualCount = mutualCount[i];
                            newMutualFriends = newMutualFriends.concat(user);
                        }
                        this.setState({mutualFriends: newMutualFriends});
                    }
                )

            }
        )
    }

    fetchScheduleFriends() {
        getScheduleFriends().then(
            (res) => {
                const scheduleFriends = res.data.schedulefriends || [];
                const promises = [];
                const mutualCourses = [];
                scheduleFriends.forEach(
                    (item) => {
                        promises.push(getUser(item.userid));
                        mutualCourses.push(item.courses);
                    }
                )

                Promise.all(promises).then(
                    (responses) => {
                        let newScheduleFriends = [];
                        for(let i = 0; i < responses.length; i++) {
                            const user = responses[i].data;
                            user.mutualCourses = mutualCourses[i];
                            newScheduleFriends = newScheduleFriends.concat(user);
                        }
                        this.setState({scheduleFriends: newScheduleFriends});
                    }
                )
            }
        )
    }

    componentDidMount(){
        this.fetchFriends();
        this.fetchGroups();
        this.fetchMutualFriends();
        this.fetchScheduleFriends();
    }

    searchFriend = event => {
        event.preventDefault();
        searchUser(this.state.query).then(res => {
            this.setState({searchedUsers: res.data});
        })
    }

    setQuery = event => {
        this.setState({ query: event.target.value});
    }

    handleAddUser = userid => {
        sendFriendRequest(userid).then((res)=>{
            this.fetchFriends();
            this.fetchMutualFriends();
            this.fetchScheduleFriends();
        });
    }

    handleRemoveFriend = userid => {
        removeFriend(userid).then(
            () => {
                this.fetchFriends();
                this.fetchMutualFriends();
                this.fetchScheduleFriends();
            }
        )
    }

    handleRemoveGroup = groupId => {
        removeGroup(groupId).then(
            () => {
                this.fetchGroups();
            }
        )
    }

    handleSelectFriend = userId => {
        this.props.history.push(`/home/profile/${userId}`);
    }

    render() {
        const searchedList = this.state.searchedUsers;
        const listItems = !searchedList ? [] : searchedList.map((user) => (
            <ListItem key={user.ID} divider button onClick={()=>this.handleSelectFriend(user.ID)}>
                <ListItemAvatar>
                    <Avatar src={`${process.env.REACT_APP_API_URL}/api/users/${user.ID}/pfp`}>{user.firstname.charAt(0).toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText 
                    primary={`${user.firstname}  ${user.lastname}`}
                    secondary={user.username}
                >
            
                </ListItemText>
                <ListItemSecondaryAction>
                    {
                    this.context.authenticatedUser._id === user.ID
                    ? <div></div>
                    : this.state.sentFriendRequests.some((request)=> request.Userid === user.ID) 
                    ? <div>Pending</div> 
                    : this.state.friendList.some((friend)=>friend.id === user.ID) 
                    ? <div>Friends</div> 
                    : this.state.receivedFriendRequests.some((request)=> request.Userid === user.ID)
                    ? <div>Requested</div>
                    :
                    <IconButton aria-label="accept" onClick={()=>this.handleAddUser(user.ID)}>
                        <PersonAddIcon  />
                    </IconButton>
                    }

                </ListItemSecondaryAction>
            </ListItem>
        ))
        const mutualFriends = this.state.mutualFriends;
        const mutualFriendItems = !mutualFriends ? [] : mutualFriends.map((user) => (
            <ListItem key={user._id} button divider onClick={()=>this.handleSelectFriend(user._id)}>
                <ListItemAvatar>
                    <Avatar src={`${process.env.REACT_APP_API_URL}/api/users/${user._id}/pfp`}>{user.firstname.charAt(0).toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText 
                    primary={`${user.firstname}  ${user.lastname} (${user.mutualCount} mutual friends)`}
                    secondary={user.username}
                >
                </ListItemText>
                <ListItemSecondaryAction>
                    <IconButton aria-label="accept" onClick={()=>this.handleAddUser(user._id)}>
                        <PersonAddIcon  />
                    </IconButton>
                </ListItemSecondaryAction>
            </ListItem>
        ))
        const scheduleFriends = this.state.scheduleFriends;
        const scheduleFriendItems = !scheduleFriends ? [] : scheduleFriends.map((user) => (
            <ListItem key={user._id} button divider onClick={()=>this.handleSelectFriend(user._id)}>
                <ListItemAvatar>
                    <Avatar src={`${process.env.REACT_APP_API_URL}/api/users/${user._id}/pfp`}>{user.firstname.charAt(0).toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText 
                    primary={`${user.firstname}  ${user.lastname} (Mutual courses: ${user.mutualCourses.toString()})`}
                    secondary={user.username}
                >
                </ListItemText>
                <ListItemSecondaryAction>
                    <IconButton aria-label="accept" onClick={()=>this.handleAddUser(user._id)}>
                        <PersonAddIcon  />
                    </IconButton>
                </ListItemSecondaryAction>
            </ListItem>
        ))
        const friends = this.state.friendList;
        const friendItems = !friends ? [] : friends.map((user) => (
            <ListItem key={user.id} button divider onClick={()=>this.handleSelectFriend(user.id)}>
                <ListItemAvatar>
                    <Avatar src={`${process.env.REACT_APP_API_URL}/api/users/${user.id}/pfp`}>{user.firstName.charAt(0).toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText 
                    primary={`${user.firstName}  ${user.lastName}`}
                    secondary={user.username}
                >
                </ListItemText>
                <ListItemSecondaryAction>
                    <IconButton aria-label="remove" onClick={()=>this.handleRemoveFriend(user.id)}>
                        <RemoveIcon  />
                    </IconButton>
                </ListItemSecondaryAction>
            </ListItem>
        ))
        const groups = this.state.groups;
        const groupItems = !groups ? [] : groups.map((group) => (
            <ListItem key={group.ID} button divider onClick={()=>{this.setState({openGroupDialog: true, selectedGroup: group})}}>
                <ListItemText 
                    primary={`${group.name}`}
                    secondary={`${group.createdby === this.context.authenticatedUser._id ? 'Admin' : 'Member'}`}
                >
                </ListItemText>
                {group.createdby === this.context.authenticatedUser._id &&
                <ListItemSecondaryAction>
                    <IconButton aria-label="remove" onClick={()=>this.handleRemoveGroup(group.ID)}>
                        <RemoveIcon  />
                    </IconButton>
                </ListItemSecondaryAction>
                }

            </ListItem>
        ))
        return(
            <div>
                <GroupDialog open={this.state.openGroupDialog} handleClose={()=>{this.setState({openGroupDialog: false, selectedGroup: null})}} handleGroupUpdate={()=>{this.fetchGroups()}} groupToUpdate={this.state.selectedGroup}></GroupDialog>
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
                        <h1>Suggested Friends</h1>
                        <Select
                        value={this.state.suggestMethod}
                        onChange={(e)=>this.setState({suggestMethod: e.target.value})}
                        >
                        <MenuItem value={this.suggestMethods.mutualFriend}>Suggest by mutual friends</MenuItem>
                        <MenuItem value={this.suggestMethods.mutualCourse}>Suggest by mutual courses</MenuItem>
                        </Select>
                        <List>
                            {
                                this.state.suggestMethod === this.suggestMethods.mutualFriend ?
                                (mutualFriendItems.length > 0 ? mutualFriendItems : "You have no suggested friends at the moment") :
                                (scheduleFriendItems.length > 0 ? scheduleFriendItems : "You have no suggested friends at the moment")
                            }
                            
                        </List>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <h1>Group list                     
                            <IconButton aria-label="accept" onClick={()=>{this.setState({openGroupDialog: true})}}>
                                <GroupAddIcon  />
                            </IconButton>
                        </h1>

                        <List>
                            {groupItems.length > 0 ? groupItems : "You are not a part of any groups at the moment"}
                        </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <h1>Friend list</h1>
                        <List>
                            {friendItems.length > 0 ? friendItems : "You have no friends at the moment"}
                        </List>

                    </Grid>

                </Grid>
            </div>
            
        )

    }
}


export default Friends;

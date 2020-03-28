import React from 'react';
import '../styles/pages/Friends.css';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Grid, List, ListItem, ListItemText, ListItemAvatar, Avatar, ListItemSecondaryAction, IconButton } from '@material-ui/core';
import { getFriends} from '../services/FriendService';
import { getUser } from '../services/UserService';
import { Route } from 'react-router-dom';
import Calendar from './components/Calendar/Calendar';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';


class Compare extends React.Component {
    static contextType = AuthContext;

    constructor(props) {
        super(props);
        this.state = {
            friendList: [],
            selectedFriends: []
        };
    }

    fetchFriends() {
        console.log('!!!!');
        this.setState({friendList: []});
        getFriends(this.context.authenticatedUser._id).then(
            (response) => {
                if(response.data.friends) response.data.friends.forEach(
                    (item) => {
                        const friendId = this.context.authenticatedUser._id === item.user1 ? item.user2 : item.user1;
                        getUser(friendId).then(
                            (res) => {
                                const user = res.data;
                                console.log("this is state in fetch Friends")
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

    componentWillMount(){
        this.fetchFriends();
        this.setState({selectedFriends: [this.context.authenticatedUser._id]})
    }

    toggleSelectFriend = userId => {
        if(this.state.selectedFriends.includes(userId)){
            const index = this.state.selectedFriends.indexOf(userId);
            let temp = this.state.selectedFriends;
            temp.splice(index,1);
            this.setState({selectedFriends: temp});
        } else {
            let temp = this.state.selectedFriends;
            temp.push(userId);
            this.setState({selectedFriends: temp});
        }       
    }

    render() {
        const friends = this.state.friendList;
        const selectedFriends = this.state.selectedFriends;
        const friendItems = !friends ? [] : friends.map((user) => (
            <ListItem button divider onClick={()=>this.toggleSelectFriend(user.id)}>
                <ListItemAvatar>
                    <Avatar>{user.firstName.charAt(0).toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText 
                    primary={`${user.firstName}  ${user.lastName}`}
                    secondary={user.username}
                >
            
                </ListItemText>
                <ListItemSecondaryAction>
                    { this.state.selectedFriends.some((request)=> request == user.id) 
                    ? <IconButton size="small" aria-label="de-select" onClick={()=>this.toggleSelectFriend(user.id)}>
                    <CheckBoxIcon fontSize="small" />
                    </IconButton>
                    : <IconButton size="small" aria-label="select" onClick={()=>this.toggleSelectFriend(user.id)}>
                    <CheckBoxOutlineBlankIcon fontSize="small" />
                    </IconButton>
                    }

                </ListItemSecondaryAction>
            </ListItem>
        ))
        return(
            <Grid container spacing={4} >
                <Grid item xs={12} md={6}>
                    <h1>Friend list</h1>
                    <List>
                        {friendItems}
                    </List>
                    <h1>Schedule</h1>
                    <Calendar users={selectedFriends} canEdit={false}></Calendar>
                </Grid>
            </Grid>
        )

    }
}

export default Compare;
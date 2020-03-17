import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Container, Grid, List, ListItem, ListItemText, ListItemAvatar, Avatar, ListItemSecondaryAction, IconButton } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import AuthContext from '../../../context/AuthContext';
import styles from './RequestsStyles';
import { acceptFriendRequest, getFriends } from '../../../services/FriendService';
import { getUser } from '../../../services/UserService';

class Requests extends React.Component {
    static contextType = AuthContext;
    constructor(props) {
        super(props);
        this.state = {
            friendRequests: []
        }
    }

    handleAcceptFriend = (requestId) => {
        console.log(requestId);
        acceptFriendRequest(requestId).then(
            () => {
                this.fetchFriendRequests();
            }
        )
    }

    fetchFriendRequests() {
        this.setState({friendRequests: []})
        getFriends(this.context.authenticatedUser._id).then(
            (response) => {
                console.log(response);
                if(!response.data.receivedfriendrequests) return;
                response.data.receivedfriendrequests.forEach(
                    (friendRequest) => {
                        getUser(friendRequest.user1).then(
                            (res) => {
                               const user = res.data;
                               this.setState(
                                   {
                                       friendRequests : this.state.friendRequests.concat([{
                                           id: friendRequest.ID,
                                           userId: user._id,
                                           firstName: user.firstname,
                                           lastName: user.lastname,
                                           username: user.username
                                         }])
                                   }
                               )
                            }
                        )
                    });
            }
        )
    }
    componentWillMount(){
        this.fetchFriendRequests();
    }
    // this.context.authenticatedUser
    render() {
        const { classes } = this.props;
        console.log(this.context.authenticatedUser);
        const friendRequestList = this.state.friendRequests;
        const listItems = !friendRequestList ? [] : friendRequestList.map((request) => (
            <ListItem divider>
                <ListItemAvatar>
                    <Avatar>{request.firstName.charAt(0).toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText 
                    primary={`${request.firstName} ${request.lastName}`}
                    secondary={request.username}
                >
                
                </ListItemText>
                <ListItemSecondaryAction>
                    <IconButton size="small" aria-label="accept" onClick={()=>this.handleAcceptFriend(request.id)}>
                      <CheckIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" aria-label="decline">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                </ListItemSecondaryAction>
            </ListItem>
        ))
        return  (
                <Grid container spacing={4} >
                    <Grid item xs={12} md={6}>
                        <h1>Friend requests</h1>
                        <List>
                            {listItems}
                        </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <h1>Event requests</h1>
                        <List>
                            {/* {listItems} */}
                        </List>
                    </Grid>
                </Grid>
        )
    }
}

export default withStyles(styles)(Requests);
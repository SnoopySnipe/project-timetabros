import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Grid, List, ListItem, ListItemText, ListItemAvatar, Avatar, ListItemSecondaryAction, IconButton } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import AuthContext from '../../../context/AuthContext';
import styles from './RequestsStyles';
import { acceptFriendRequest, getFriends } from '../../../services/FriendService';
import { getUser } from '../../../services/UserService';
import { withRouter } from 'react-router-dom';

class Requests extends React.Component {
    static contextType = AuthContext;
    constructor(props) {
        console.log(props);
        super(props);
    }

    handleAcceptFriend = (requestId) => {
        console.log(requestId);
        acceptFriendRequest(requestId).then(
            () => {
                this.fetchFriendRequests();
            }
        )
    }


    // componentWillMount(){
    //     this.fetchFriendRequests();
    // }
    // this.context.authenticatedUser
    render() {
        const { classes } = this.props;
        console.log(this.context.authenticatedUser);
        const friendRequestList = this.props.friendRequests;
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

export default withStyles(styles)(withRouter(Requests));
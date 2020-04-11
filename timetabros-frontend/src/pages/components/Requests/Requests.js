import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Grid, List, ListItem, ListItemText, ListItemAvatar, Avatar, ListItemSecondaryAction, IconButton } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import AuthContext from '../../../context/AuthContext';
import styles from './RequestsStyles';
import { acceptFriendRequest,removeFriend } from '../../../services/FriendService';
import { updateEventStatus, removeEventMember } from '../../../services/ScheduleService';
import { acceptGroup, removeGroupMember } from '../../../services/GroupService';
import { withRouter } from 'react-router-dom';
import moment from 'moment';

class Requests extends React.Component {
    static contextType = AuthContext;

    handleAcceptFriend = (requestId) => {
        acceptFriendRequest(requestId).then(
            () => {
                this.props.onFriendRequestChange();
            }
        )
    }

    handleRemoveFriend = (friendId) => {
        removeFriend(friendId).then(
            () => {
                this.props.onFriendRequestChange();
            }
        )
    }

    handleAcceptEvent = (eventId) => {
        updateEventStatus(eventId, 'going').then(
            () => {
                this.props.onEventRequestChange();
            }
        )
    }

    handleRemoveEvent = (eventId) => {
        removeEventMember(eventId, this.context.authenticatedUser._id).then(
            () => {
                this.props.onEventRequestChange();
            }
        )
    }

    handleAcceptGroup = (groupId) => {
        acceptGroup(groupId).then(
            () => {
                this.props.onGroupRequestChange();
            }
        )
    }

    handleRemoveGroupMember = (groupId) => {
        removeGroupMember(groupId, this.context.authenticatedUser._id).then(
            () => {
                this.props.onGroupRequestChange();
            }
        )
    }

    render() {
        const friendRequestList = this.props.friendRequests;
        const listItems = !friendRequestList ? [] : friendRequestList.map((request) => (
            <ListItem key={request.id} divider>
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
                    <IconButton size="small" aria-label="decline" onClick={()=>this.handleRemoveFriend(request.userId)}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                </ListItemSecondaryAction>
            </ListItem>
        ))
        const groupRequestList = this.props.groupRequests;
        const groupItems = !groupRequestList ? [] : groupRequestList.map((group) => (
            <ListItem key={group.ID} divider>
                <ListItemText 
                    primary={`${group.name}`}
                    secondary={`Invited by ${group.createdbyUser.firstname} ${group.createdbyUser.lastname} (${group.createdbyUser.username})`}
                >
                
                </ListItemText>
                <ListItemSecondaryAction>
                    <IconButton size="small" aria-label="accept" onClick={()=>{this.handleAcceptGroup(group.ID)}}>
                      <CheckIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" aria-label="decline" onClick={()=>{this.handleRemoveGroupMember(group.ID)}}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                </ListItemSecondaryAction>
            </ListItem>
        ))
        const eventRequestList = this.props.eventRequests;
        const eventItems = !eventRequestList ? [] : eventRequestList.map((event) => (
            <ListItem key={event.ID} divider>
                <ListItemText 
                style={{paddingRight:'24px'}}
                    primary={`${event.title} - ${event.description}`}
                    secondary={`${moment((new Date(event.startdate))).utcOffset(0).format("dddd, MMMM Do YYYY, h:mm a")} - ${moment((new Date(event.enddate))).utcOffset(0).format("dddd, MMMM Do YYYY, h:mm a")}`}
                >
                
                </ListItemText>
                <ListItemSecondaryAction>
                    <IconButton size="small" aria-label="accept" onClick={()=>{this.handleAcceptEvent(event.ID)}}>
                      <CheckIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" aria-label="decline" onClick={()=>this.handleRemoveEvent(event.ID)}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                </ListItemSecondaryAction>
            </ListItem>
        ))
        return  (
                <Grid container spacing={4} >
                    <Grid item xs={12} lg={4}>
                        <h1>Friend requests</h1>
                        <List>
                            {listItems.length > 0 ? listItems : "You have no friend requests at the moment"}
                        </List>
                    </Grid>
                    <Grid item xs={12} lg={4}>
                        <h1>Group requests</h1>
                        <List>
                            {groupItems.length > 0 ? groupItems : "You have no group requests at the moment"}
                        </List>
                    </Grid>
                    <Grid item xs={12} lg={4}>
                        <h1>Event requests</h1>
                        <List>
                            {eventItems.length > 0 ? eventItems : "You have no event requests at the moment"}
                        </List>
                    </Grid>
                </Grid>
        )
    }
}

export default withStyles(styles)(withRouter(Requests));
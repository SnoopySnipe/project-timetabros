import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Container, Grid, List, ListItem, ListItemText, ListItemAvatar, Avatar, ListItemSecondaryAction, IconButton } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import AuthContext from '../../../context/AuthContext';
import styles from './RequestsStyles';
class Requests extends React.Component {
    static contextType = AuthContext;
    // this.context.authenticatedUser
    render() {
        const { classes } = this.props;
        console.log(this.context.authenticatedUser);
        const list = [{requestorName: 'yeet Hay'}, {requestorName: 'Jeffrey Man-Hei Leung'}];
        const listItems = list.map((request) => (
            <ListItem divider>
                <ListItemAvatar>
                    <Avatar>{request.requestorName.charAt(0).toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText>
                {request.requestorName}
                </ListItemText>
                <ListItemSecondaryAction>
                    <IconButton size="small" aria-label="accept">
                      <CheckIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" aria-label="accept">
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
                            {listItems}
                        </List>
                    </Grid>
                </Grid>
        )
    }
}

export default withStyles(styles)(Requests);
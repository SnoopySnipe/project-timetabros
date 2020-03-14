import React from 'react';
import { InputBase, IconButton, Paper, Divider } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import styles from './AddFriendBarStyles';
import { withStyles } from '@material-ui/core/styles';

class AddFriendBar extends React.Component {


    render () {
        const {classes} = this.props;
        return (
            <Paper component="form" className={classes.root}>
                <GroupAddIcon fontSize="small"/>
            <InputBase
              className={classes.input}
              placeholder="Add friend"
            />
            <Divider className={classes.divider} orientation="vertical" />
            <IconButton color="primary" className={classes.iconButton} aria-label="directions">
            <CheckIcon></CheckIcon>
            </IconButton>
          </Paper>
        )
    }
}

export default withStyles(styles)(AddFriendBar);
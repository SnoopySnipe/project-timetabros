import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Schedule from '@material-ui/icons/Schedule';
export const sideNavList = (
    <div>
        <ListItem button>
            <ListItemIcon>
                <Schedule></Schedule>
            </ListItemIcon>
            <ListItemText primary="Schedule"></ListItemText>
        </ListItem>
    </div>
)
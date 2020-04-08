import React, { useEffect, useContext } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import MenuItem from '@material-ui/core/MenuItem';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import { getFriends } from '../../../services/FriendService';
import { getUser } from '../../../services/UserService';
import AuthContext from '../../../context/AuthContext';
import { createGroup } from '../../../services/GroupService';
const GroupDialog = (props) => {
    const context = useContext(AuthContext);
    const [groupName, setGroupName] = React.useState('');
    const [groupAbout, setGroupAbout] = React.useState('');
    const [visibility, setVisibility] = React.useState('private');
    //const [isGroupEvent, setIsGroupEvent] = React.useState(false);
    const [checked, setChecked] = React.useState([]);
    const [friendList, setFriendList] = React.useState([]);

    const handleGroupMemberToggle = (value) => () => {
      const currentIndex = checked.indexOf(value);
      const newChecked = [...checked];
  
      if (currentIndex === -1) {
        newChecked.push(value);
      } else {
        newChecked.splice(currentIndex, 1);
      }
  
      setChecked(newChecked);
    };
    const handleSubmit = () => {
      if(props.groupToUpdate) {
        // handleUpdateEvent();
      } else {
        handleCreateGroup();
      }
    }
    const handleCreateGroup = () => {
      const groupMembers = checked.map((userId)=>{return {userid: userId, role: 'invited'}})
      createGroup(groupName, groupAbout, visibility, groupMembers).then(
        () => {
          props.handleGroupUpdate();
          props.handleClose();
        }
      )
    }

    // const handleUpdateEvent = () => {
    //   getGroup(props.groupToUpdate.ID).then(
    //     (response) => {
    //       console.log(response.data);
    //       const existingGroupMembers = response.data.groupmembers || [];
    //       const groupMembers = checked.map((userId)=>{
    //         const foundMember = existingGroupMembers.some((member) =>
    //         {
    //           if(member.userid === userId) {
    //             return member;
    //           }
    //         });
    //         console.log(foundMember);
    //         if(foundMember)
    //         {
    //           console.log('found');
    //           return {userid: userId, role: foundMember.role}
    //         } else {
    //           return {userid: userId, role: 'invited'}
    //         }
    //       })
    //       updateGroup(props.groupToUpdate.ID, groupName, groupAbout, visibility, groupMembers).then(
    //         () => {
    //           props.handleGroupUpdate();
    //           props.handleClose();
    //         }
    //       )
    //     }
    //   )

    // }
    // const toggleGroupChecked = () => {
    //     setIsGroupEvent(prev => !prev);
    //     console.log(isGroupEvent);
    // };
      
    useEffect(() => {
      if (!props.open) return;
      setChecked([]);
      setFriendList([]);
      setGroupName('');
      setGroupAbout('');
      if(props.groupToUpdate) {
        setGroupName(props.groupToUpdate.name);
        setGroupAbout(props.groupToUpdate.about);
      }
      getFriends(context.authenticatedUser._id).then((response) => {
        console.log(response.data.friends);
        if(response.data.friends) response.data.friends.forEach(
            (item) => {
                const friendId = item.Userid;
                getUser(friendId).then(
                    (res) => {
                        const user = res.data;
                        setFriendList(friendList => friendList.concat([{
                          id: user._id,
                          firstName: user.firstname,
                          lastName: user.lastname,
                          username: user.username
                        }]));
                        console.log(props.groupToUpdate);
                        if(props.groupToUpdate && props.groupToUpdate.groupmembers && props.groupToUpdate.groupmembers.some((member)=>member.userid===friendId)) {
                          setChecked(checked => checked.concat(friendId));
                        }
                      }
                )
            }
        );
      });
    }, [props.open, props.groupToUpdate, context.authenticatedUser]);
  return (
    props.open &&
    <div>
      {/* <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Open form dialog
      </Button> */}
      <Dialog disableBackdropClick open={props.open} onClose={props.handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{props.groupToUpdate ? 'Group Update' : 'Group Creation'}</DialogTitle>
        <DialogContent>
          {/* <DialogContentText>
            To subscribe to this website, please enter your email address here. We will send updates
            occasionally.
          </DialogContentText> */}
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Group Name"
            fullWidth
            value={groupName}
            onChange={(event)=>{setGroupName(event.target.value)}}
          />
          <TextField
            margin="dense"
            id="description"
            label="Group Description"
            fullWidth
            value={groupAbout}
            onChange={(event)=>{setGroupAbout(event.target.value)}}
          />

          <TextField
            margin="dense"
            id="item-type"
            select
            label="Visibility"
            value={visibility}
            onChange={(event)=>{setVisibility(event.target.value)}}
          >

            <MenuItem value={'public'}>
              Public
            </MenuItem>
            <MenuItem value={'private'}>
              Private
            </MenuItem>
        </TextField>
        {
        <List>
          {
            friendList.map((friend) => {
              return (
              <ListItem button key={friend.id} onClick={handleGroupMemberToggle(friend.id)}>
              <ListItemIcon>
                  <Checkbox
                      edge="start"
                      checked={checked.indexOf(friend.id) !== -1}
                      disableRipple
                  />
              </ListItemIcon>
              <ListItemText primary={`${friend.firstName} ${friend.lastName}`} secondary={friend.username}/>
              </ListItem>
              
              )
            })
          }
        </List>}
        </DialogContent>
        <DialogActions>
          <Button onClick={props.handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            {props.groupToUpdate ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default GroupDialog;
import React, { useEffect, useContext } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import IconButton from '@material-ui/core/IconButton';
import { getFriends } from '../../../services/FriendService';
import { getUser } from '../../../services/UserService';
import AuthContext from '../../../context/AuthContext';
import { createGroup, addGroupMember, removeGroupMember, getGroup, updateGroup } from '../../../services/GroupService';

const GroupDialog = (props) => {
    const context = useContext(AuthContext);
    const [groupName, setGroupName] = React.useState('');
    const [groupAbout, setGroupAbout] = React.useState('');
    const [visibility, ] = React.useState('public');
    const [uninvitedFriends, setUninvitedFriendList] = React.useState([]);
    const [groupMembers, setGroupMembers] = React.useState([]);

    const handleSubmit = () => {
      if(props.groupToUpdate) {
        handleUpdateEvent();
      } else {
        handleCreateGroup();
      }
    }

    const handleAddGroupMember = (friend) => {
      addGroupMember(props.groupToUpdate.ID, friend._id).then(()=>{
        friend.role = 'invited';
        handleMemberUpdate();
      });
    }

    const handleRemoveGroupMember = (groupMember) => {
      removeGroupMember(props.groupToUpdate.ID, groupMember._id).then(()=>{
        groupMember.role = '';
        handleMemberUpdate();
      });
    }

    const handleMemberUpdate = () => {
      getGroup(props.groupToUpdate.ID).then(
        (res) => {
          fetchGroupMembers(res.data.groupmembers || []);
        }
      )
      props.handleGroupUpdate();
    }

    const handleCreateGroup = () => {
      // const groupMembers = checked.map((userId)=>{return {userid: userId, role: 'invited'}})
      createGroup(groupName, groupAbout, visibility, [{userid: context.authenticatedUser._id, role: 'admin'}]).then(
        () => {
          props.handleGroupUpdate();
          props.handleClose();
        }
      )
    }

    const handleUpdateEvent = () => {
      updateGroup(props.groupToUpdate.ID, groupName, groupAbout, visibility).then(
        () => {
          props.handleGroupUpdate();
          props.handleClose();
        }
      );
    }

    const fetchGroupMembers = (members) => {
      const promises = [];
      const roles = [];
      members.forEach(
        (member) => {
          if(member.userid !== context.authenticatedUser._id) {
            promises.push(getUser(member.userid));
            roles.push(member.role);
          }
        }
      );
      let newGroupMembers = [];
      Promise.all(promises).then(
        (responses) => {
          for(let i = 0; i < promises.length; i++) {
            const user = responses[i].data;
            user.role = roles[i];
            newGroupMembers = newGroupMembers.concat(user);
          }
          if(props.groupToUpdate.createdby === context.authenticatedUser._id) {
            getFriends(context.authenticatedUser._id).then(
              (response) => {
                const friendList = response.data.friends || [];
                const promises = [];
                let newUninvitedFriends = [];
                for (const item of friendList) {
                  const friendId = item.Userid;
                  if (!members.some((member) => member.userid === friendId)) promises.push(getUser(friendId));
                }
                Promise.all(promises).then(
                  (responses) => {
                    for (const res of responses) {
                      newUninvitedFriends = newUninvitedFriends.concat(res.data);
                    }
                    setGroupMembers(newGroupMembers);
                    setUninvitedFriendList(newUninvitedFriends);
                  }
                )
              }

            )
          } else {
            setGroupMembers(newGroupMembers);
          }
        }
      )
    }

    useEffect(() => {
      if (!props.open) return;
      setGroupName('');
      setGroupAbout('');
      if(props.groupToUpdate) {
        setGroupName(props.groupToUpdate.name);
        setGroupAbout(props.groupToUpdate.about);
        fetchGroupMembers(props.groupToUpdate.groupmembers || []);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.open, props.groupToUpdate, context.authenticatedUser]);
    function compare(a, b) {
      if (a._id > b._id) return 1;
      if (b._id > a._id) return -1;
  
      return 0;
    }
  return (
    props.open &&
    <div>
      <Dialog disableBackdropClick open={props.open} onClose={props.handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{props.groupToUpdate ? 'Group Update' : 'Group Creation'}</DialogTitle>
        <DialogContent>
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
        {props.groupToUpdate &&
        <List>
          {groupMembers.slice().sort(compare).map(
              (groupMember) =>
                <ListItem key={groupMember._id}>
                  {props.groupToUpdate.createdby === context.authenticatedUser._id && <ListItemIcon>
                      <IconButton aria-label="accept" onClick={()=>handleRemoveGroupMember(groupMember)}>
                                <RemoveIcon  />
                      </IconButton>
                  </ListItemIcon>}
                  <ListItemText primary={`${groupMember.firstname} ${groupMember.lastname}`} secondary={groupMember.username} />
                  <ListItemSecondaryAction>
                    {groupMember.role}
                  </ListItemSecondaryAction>
                </ListItem>
              )
          }
          {  props.groupToUpdate.createdby === context.authenticatedUser._id ?
            uninvitedFriends.map((friend) => {
              return (
              // <ListItem button key={friend.id} onClick={handleGroupMemberToggle(friend.id)}>
              <ListItem button key={friend._id} >
              {<ListItemIcon>
                      <IconButton aria-label="accept"onClick={()=>handleAddGroupMember(friend)}>
                                <AddIcon  />
                      </IconButton>
              </ListItemIcon>}

              <ListItemText primary={`${friend.firstname} ${friend.lastname}`} secondary={friend.username}/>
              <ListItemSecondaryAction>
                {friend.role}
              </ListItemSecondaryAction>
              </ListItem>
              
              )
            }) : <div></div>
          }
        </List>}
        </DialogContent>
        <DialogActions>
          <Button onClick={props.handleClose} color="primary">
            Close
          </Button>
          {
            (!props.groupToUpdate || props.groupToUpdate.createdby === context.authenticatedUser._id) &&
            <Button onClick={handleSubmit} color="primary">
              {props.groupToUpdate ? 'Update' : 'Create'}
            </Button>
          }

        </DialogActions>
      </Dialog>
    </div>
  );
}

export default GroupDialog;
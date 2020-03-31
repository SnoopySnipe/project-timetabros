import React, { useEffect, useContext } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import MenuItem from '@material-ui/core/MenuItem';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import { getFriends } from '../../../services/FriendService';
import { getUser } from '../../../services/UserService';
import { getGroups } from '../../../services/GroupService';
import AuthContext from '../../../context/AuthContext';
import GroupDialog from '../GroupDialog/GroupDialog';
import { createEventItem, updateEventItem } from '../../../services/ScheduleService';
const ScheduleDialog = (props) => {
    const context = useContext(AuthContext);
    const [eventName, setEventName] = React.useState('');
    const [eventDescription, setEventDescription] = React.useState('');
    const [isRecurring, setIsRecurring] = React.useState(true);
    const [isGroupEvent, setIsGroupEvent] = React.useState(false);
    const [checked, setChecked] = React.useState([]);
    const [friendList, setFriendList] = React.useState([]);
    const [groupList, setGroupList] = React.useState([]);
    const [groupId, setGroupId] = React.useState('none');
    const handleSelectEventType = event => {
        setIsRecurring(event.target.value);
    }
    const handleSelectGroup = event => {
      setGroupId(event.target.value);
    }
    const handleSubmit = () => {
      if(props.eventToUpdate) {
        handleUpdateEvent();
      } else {
        handleCreateEvent();
      }
    }
    const handleCreateEvent = () => {
      console.log(eventName);
      createEventItem(eventName, props.createStartDate, props.createEndDate, eventDescription).then(
        () => {
          props.handleCreated();
          props.handleClose();
        }
      )
    }

    const handleUpdateEvent = () => {
      console.log(props.eventToUpdate);
      updateEventItem(props.eventToUpdate.id, eventName, eventDescription, props.createStartDate, props.createEndDate).then(
        () => {
          props.handleCreated();
          props.handleClose();
        }
      )
    }


      
    useEffect(() => {
      if (!props.open) return;
      setEventName('');
      setEventDescription('');
      if(props.eventToUpdate) {
        setEventName(props.eventToUpdate.name);
        setEventDescription(props.eventToUpdate.description);
      }
      console.log('yeeeet');
      getGroups(context.authenticatedUser._id).then(
        (response) => {
          const ownedGroups = response.data.userownedgroups || [];
          const memberGroups = response.data.usermembergroups || [];
          setGroupList(ownedGroups.concat(memberGroups));
        }
      )
      //   getFriends(context.authenticatedUser._id).then((response) => {
      //     console.log(response.data.friends);
      //     if(response.data.friends) response.data.friends.forEach(
      //         (item) => {
      //             const friendId = context.authenticatedUser._id === item.user1 ? item.user2 : item.user1;
      //             getUser(friendId).then(
      //                 (res) => {
      //                     const user = res.data;
      //                     setFriendList(friendList => friendList.concat([{
      //                       id: user._id,
      //                       firstName: user.firstname,
      //                       lastName: user.lastname,
      //                       username: user.username
      //                     }]));
      //                  }
      //             )
      //         }
      //     );
      // });
    }, [props.open]);
  return (
    props.open &&
    <div>
      {/* <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Open form dialog
      </Button> */}

      <Dialog disableBackdropClick open={props.open} onClose={props.handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{props.eventToUpdate ? 'Event Update' : 'Event Creation'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            value={eventName}
            onChange={(event) => setEventName(event.target.value)}
            fullWidth
          />
          <TextField
            margin="dense"
            id="description"
            label="Description"
            value={eventDescription}
            onChange={(event) => setEventDescription(event.target.value)}
            fullWidth
          />
          <TextField
            margin="dense"
            id="start"
            label="Selected start time"
            defaultValue={props.createStartDate.toString()}
            fullWidth
            disabled
          />
          <TextField
            margin="dense"
            id="end"
            label="Selected end time"
            defaultValue={props.createEndDate.toString()}
            fullWidth
            disabled
          />
          <TextField
            margin="dense"
            id="item-type"
            select
            label="Event frequency"
            value={isRecurring}
            onChange={handleSelectEventType}
          >

            <MenuItem value={false}>
              One time
            </MenuItem>
            <MenuItem value={true}>
              Recurring Weekly
            </MenuItem>
        </TextField>
        <TextField
            margin="dense"
            id="item-type"
            select
            label="Group"
            value={groupId}
            onChange={handleSelectGroup}
          >

            <MenuItem value={'none'}>
              Just me
            </MenuItem>
            {
            groupList.map((group) => {
              return (
                <MenuItem value={group.ID}>
                  {group.name}
                </MenuItem>
              )
            })
          }
        </TextField>
        {/* <InputLabel> Group event <Switch size="small" checked={isGroupEvent} onChange={toggleGroupChecked} /></InputLabel>
        {isGroupEvent &&
        <List>
          {
            groupList.map((group) => {
              return (
              <ListItem key={group.ID}>
              <ListItemIcon>
                  <Checkbox
                      edge="start"
                      checked={checked.indexOf(group.ID) != -1}
                      disableRipple
                  />
              </ListItemIcon>
              <ListItemText primary={`${group.name}`}/>
              </ListItem>
              
              )
            })
          }
        </List>} */}
        </DialogContent>
        <DialogActions>
          <Button onClick={props.handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            {props.eventToUpdate ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      <GroupDialog open={false}></GroupDialog>
    </div>
  );
}

export default ScheduleDialog;
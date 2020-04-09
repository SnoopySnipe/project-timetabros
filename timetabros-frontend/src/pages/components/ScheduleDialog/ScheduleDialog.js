import React, { useEffect, useContext } from 'react';
import Button from '@material-ui/core/Button';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import { getFriends } from '../../../services/FriendService';
import { getUser } from '../../../services/UserService';
import { getGroups, getGroup } from '../../../services/GroupService';
import AuthContext from '../../../context/AuthContext';
import GroupDialog from '../GroupDialog/GroupDialog';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import moment from 'moment';
import { addEventMember, removeEventMember, createEventItem, updateEventItem, updateEventStatus } from '../../../services/ScheduleService';
const ScheduleDialog = (props) => {
    const context = useContext(AuthContext);
    const [tabIndex, setTabIndex] = React.useState(0);
    const [eventName, setEventName] = React.useState('');
    const [eventDescription, setEventDescription] = React.useState('');
    // const [isRecurring, setIsRecurring] = React.useState(true);
    // const [isGroupEvent, setIsGroupEvent] = React.useState(false);
    // const [checked, setChecked] = React.useState([]);
    const [friendList, setFriendList] = React.useState([]);
    const [groupList, setGroupList] = React.useState([]);
    const [groupId, setGroupId] = React.useState('none');
    const [statusToEvent, setStatusToEvent] = React.useState('');
    const [eventMembers, setEventMembers] = React.useState([]);
    // const [creatorStatus, setCreatorStatus] = React.useState('');
    // const handleEventMemberToggle = (value) => () => {
    //   const currentIndex = checked.indexOf(value);
    //   const newChecked = [...checked];
  
    //   if (currentIndex === -1) {
    //     newChecked.push(value);
    //   } else {
    //     newChecked.splice(currentIndex, 1);
    //   }
  
    //   setChecked(newChecked);
    // };
    function a11yProps(index) {
      return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
      };
    }
    // const handleSelectEventType = event => {
    //     setIsRecurring(event.target.value);
    // }
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
      let eventCreatorStatus = '';
      if(tabIndex === 1) eventCreatorStatus = 'going';
      createEventItem(eventName, props.createStartDate, props.createEndDate, JSON.stringify([{Userid: context.authenticatedUser._id, status: eventCreatorStatus}]), eventDescription, eventCreatorStatus).then(
        (response) => {
          const eventId = response.data._id;
          if(tabIndex === 1 && groupId !== 'none') {
            getGroup(groupId).then(
              (response) => {
                const groupMembers = response.data.groupmembers || [];
                groupMembers.forEach(
                  (member) => {
                    addEventMember(eventId, member.userid);
                  }
                )
                props.handleCreated();
                props.handleClose();
              }
            )
          } else {
            props.handleCreated();
            props.handleClose();
          }


        }
      )
    }
    // const handleCreatorStatusToEvent = (event, newStatus) => {
    //   console.log(event);
    //   console.log(newStatus);
    //   setCreatorStatus(newStatus);
    // }
    const handleStatusToEvent = (event, newStatus) => {
      setStatusToEvent(newStatus);
      updateEventStatus(props.eventToUpdate.id, newStatus).then(
        () => {
          props.handleCreated();
        }
      );
    }
    const handleUpdateEvent = () => {
      updateEventItem(props.eventToUpdate.id, eventName, eventDescription, props.createStartDate, props.createEndDate).then(
        () => {
          props.handleCreated();
          props.handleClose();
        }
      )
    }

    const handleAddMember = (friend) => {
      addEventMember(props.eventToUpdate.id, friend.id).then(()=>{
        friend.status = 'invited';
        handleMemberUpdate();
      });
    }

    const handleRemoveMember = (friend) => {
      removeEventMember(props.eventToUpdate.id, friend.id).then(()=>{
        friend.status = '';
        handleMemberUpdate();
      });
    }

    const handleMemberUpdate = () => {
      props.handleCreated();
    }


      
    useEffect(() => {
      console.log('yeet');
      if (!props.open) return;
      setEventName('');
      setEventDescription('');
      setStatusToEvent('');
      setFriendList([]);
      setEventMembers([]);
      if(props.eventToUpdate) {
        setTabIndex(props.eventToUpdate.creatorstatus? 1 : 0);
        setEventName(props.eventToUpdate.name);
        setEventDescription(props.eventToUpdate.description);
        const eventmembers = props.eventToUpdate.eventmembers || [];
        const foundEventMember = eventmembers.find(
          (member) => member.userid === context.authenticatedUser._id
        );
        if(foundEventMember) setStatusToEvent(foundEventMember.status);
        // setEventMembers(props.eventToUpdate.eventmembers);
        // console.log(props.eventToUpdate.eventmembers);
      }
      getGroups(context.authenticatedUser._id).then(
        (response) => {
          const ownedGroups = response.data.userownedgroups || [];
          const memberGroups = response.data.usermembergroups || [];
          setGroupList(ownedGroups.concat(memberGroups));
        }
      )
      if(props.eventToUpdate && props.eventToUpdate.createdby === context.authenticatedUser._id){
          getFriends(context.authenticatedUser._id).then((response) => {
            if(response.data.friends) response.data.friends.forEach(
                (item) => {
                    const friendId = item.Userid;
                    getUser(friendId).then(
                        (res) => {
                            const user = res.data;
                            const foundMember = props.eventToUpdate && (props.eventToUpdate.eventmembers || []).find(
                              (member) => {
                                return member.userid === friendId
                            });
                            const status = foundMember ? foundMember.status : '';
                            console.log(foundMember);
                            // if(foundMember) setChecked(checked => checked.concat(friendId));
                            setFriendList(friendList => friendList.concat([{
                              id: user._id,
                              firstName: user.firstname,
                              lastName: user.lastname,
                              username: user.username,
                              status: status
                            }]));
                         }
                    )
                }
            );
          });
      } else if (props.eventToUpdate) {
        const members = props.eventToUpdate.eventmembers || [];
        members.forEach(
          (member) => {
            const userId = member.userid;
            if(userId === context.authenticatedUser._id) return;
            getUser(userId).then(
              (res) => {
                const user = res.data;
                user.status = member.status;
                setEventMembers(eventMembers => eventMembers.concat(user));
              }
            )
          }
        )
      }


    }, [props.open, props.eventToUpdate, context.authenticatedUser]);
    const ownsEvent = !props.eventToUpdate || props.eventToUpdate.createdby === context.authenticatedUser._id;
    function compare(a, b) {
      console.log(a);
      if (a.id > b.id) return 1;
      if (b.id > a.id) return -1;
    
      return 0;
    }
  return (
    props.open &&
    <div>
      {/* <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Open form dialog
      </Button> */}

      <Dialog disableBackdropClick open={props.open} onClose={props.handleClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">{props.eventToUpdate ? 'Event Update' : 'Event Creation'}</DialogTitle>
      <Tabs 
          value={tabIndex} 
          onChange={(e, newVal)=>setTabIndex(newVal)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab disabled={props.eventToUpdate && props.eventToUpdate.creatorstatus} label="Recurring Schedule Item" {...a11yProps(0)} />
          <Tab disabled={props.eventToUpdate && !props.eventToUpdate.creatorstatus} label="Personal/Group Event Item"{...a11yProps(1)} />
        </Tabs>

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
            defaultValue={moment(props.createStartDate).utcOffset(0).format("dddd, MMMM Do YYYY, h:mm a")}
            fullWidth
            InputProps={{
              readOnly: true,
            }}
          />
          <TextField
            margin="dense"
            id="end"
            label="Selected end time"
            defaultValue={moment(props.createEndDate).utcOffset(0).format("dddd, MMMM Do YYYY, h:mm a")}
            fullWidth
            InputProps={{
              readOnly: true,
            }}
          />
          {/* <TextField
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
        </TextField> */}
        { tabIndex === 1 && !props.eventToUpdate &&
        <TextField
            margin="dense"
            id="item-type"
            select
            label="Group"
            value={groupId}
            onChange={handleSelectGroup}
            helperText="Choose a group of friends to invite, you can individually add more later"
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
        }
        {/* { tabIndex === 1 &&
        <div>
        <h4>Status</h4>
          <ToggleButtonGroup
            value={creatorStatus}
            exclusive
            onChange={handleCreatorStatusToEvent}
            style={{color:'black'}}
          >
            <ToggleButton value="going">
              <Typography color='primary'>
                      Going
              </Typography>
            </ToggleButton>
            <ToggleButton value="interested">
              <Typography color='primary'>
                      Interested
              </Typography>
            </ToggleButton>
            <ToggleButton value="not-going">
              <Typography color='primary'>
                      Not Going
              </Typography>
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
        } */}
        <DialogActions>
          <Button onClick={props.handleClose} color="primary">
            Cancel
          </Button>
          {ownsEvent ? 
          <Button onClick={handleSubmit} color="primary">
            {props.eventToUpdate ? 'Update' : 'Create'}
          </Button> : <div></div>
          }
        </DialogActions>
        {tabIndex === 1 && props.eventToUpdate &&
        <div>
        <h4>Status</h4>
          <ToggleButtonGroup
            value={statusToEvent}
            exclusive
            onChange={handleStatusToEvent}
            style={{color:'black'}}
          >
            <ToggleButton value="going">
              <Typography color='primary'>
                      Going
              </Typography>
            </ToggleButton>
            <ToggleButton value="interested">
              <Typography color='primary'>
                      Interested
              </Typography>
            </ToggleButton>
            <ToggleButton value="not-going">
              <Typography color='primary'>
                      Not Going
              </Typography>
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
        }
        {tabIndex === 1 && props.eventToUpdate &&
        <List>
          <h4>{props.eventToUpdate.createdby === context.authenticatedUser._id ? 'Manage Event Members' : 'Event Members'}</h4>
          {
            props.eventToUpdate.createdby === context.authenticatedUser._id ?
            friendList.slice().sort(compare).map((friend) => {
              return (
              <ListItem key={friend.id}>
              {props.eventToUpdate.createdby === context.authenticatedUser._id && !friend.status && <ListItemIcon>
                      <IconButton aria-label="accept"onClick={()=>handleAddMember(friend)}>
                                <AddIcon  />
                      </IconButton>
              </ListItemIcon>}
              {props.eventToUpdate.createdby === context.authenticatedUser._id && friend.status && <ListItemIcon>
                      <IconButton aria-label="accept" onClick={()=>handleRemoveMember(friend)}>
                                <RemoveIcon  />
                      </IconButton>
              </ListItemIcon>}
              <ListItemText primary={`${friend.firstName} ${friend.lastName}`} secondary={friend.username}/>
              <ListItemSecondaryAction>
                {friend.status}
              </ListItemSecondaryAction>
              </ListItem>
              
              )
            })
            : eventMembers.map(
              (eventmember) => 
              <ListItem key={eventmember._id}>
              <ListItemText primary={`${eventmember.firstname} ${eventmember.lastname}`} secondary={eventmember.username} />
              <ListItemSecondaryAction>
                {eventmember.status}
              </ListItemSecondaryAction>
              </ListItem>
              )
          }
        </List>}
        
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

      </Dialog>
      <GroupDialog open={false}></GroupDialog>
    </div>
  );
}

export default ScheduleDialog;
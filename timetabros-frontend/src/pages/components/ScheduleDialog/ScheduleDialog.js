import React, { useEffect, useContext } from 'react';
import Button from '@material-ui/core/Button';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
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
import { addEventMember, removeEventMember, createEventItem, updateEventItem } from '../../../services/ScheduleService';
const ScheduleDialog = (props) => {
    const context = useContext(AuthContext);
    const [tabIndex, setTabIndex] = React.useState(0);
    const [eventName, setEventName] = React.useState('');
    const [eventDescription, setEventDescription] = React.useState('');
    const [isRecurring, setIsRecurring] = React.useState(true);
    const [isGroupEvent, setIsGroupEvent] = React.useState(false);
    const [checked, setChecked] = React.useState([]);
    const [friendList, setFriendList] = React.useState([]);
    const [groupList, setGroupList] = React.useState([]);
    const [groupId, setGroupId] = React.useState('none');
    const [statusToEvent, setStatusToEvent] = React.useState('');
    const [eventMembers, setEventMembers] = React.useState([]);
    const handleEventMemberToggle = (value) => () => {
      const currentIndex = checked.indexOf(value);
      const newChecked = [...checked];
  
      if (currentIndex === -1) {
        newChecked.push(value);
      } else {
        newChecked.splice(currentIndex, 1);
      }
  
      setChecked(newChecked);
    };
    function a11yProps(index) {
      return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
      };
    }
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
      let creatorStatus = '';
      if(tabIndex === 1) creatorStatus = 'going';
      createEventItem(eventName, props.createStartDate, props.createEndDate, eventDescription, creatorStatus).then(
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
    const handleStatusToEvent = (event, newStatus) => {
      setStatusToEvent(newStatus);
    }
    const handleUpdateEvent = () => {
      updateEventItem(props.eventToUpdate.id, eventName, eventDescription, props.createStartDate, props.createEndDate).then(
        () => {
          const promises = [];
          for (let i = 0 ; i < friendList.length; i++) {
            setTimeout(() => {
              const isChecked = checked.some((id) => id===friendList[i].id);
              const isMember = friendList[i].status === 'going' || friendList[i].status === 'invited' || friendList[i].status === 'not-going' || friendList[i].status === 'interested';
              if(isChecked && !isMember) {
                promises.push(addEventMember(props.eventToUpdate.id, friendList[i].id));
              } else if (!isChecked && isMember) {
                promises.push(removeEventMember(props.eventToUpdate.id, friendList[i].id));
              }
          }, 1000);
            console.log(friendList[i]);

          }

          Promise.all(promises).then((res) => {
            console.log(res);
            props.handleCreated();
            props.handleClose();
          });

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

    const fetchFriends = () => {
      setFriendList([]);
      setChecked([]);
      getFriends(context.authenticatedUser._id).then((response) => {
        const promises = [];
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
                        if(foundMember) setChecked(checked => checked.concat(friendId));
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
    }
      
    useEffect(() => {
      console.log('yeet');
      if (!props.open) return;
      setEventName('');
      setEventDescription('');
      // setEventMembers([]);
      if(props.eventToUpdate) {
        setTabIndex(props.eventToUpdate.creatorstatus? 1 : 0);
        setEventName(props.eventToUpdate.name);
        setEventDescription(props.eventToUpdate.description);
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

        fetchFriends();

    }, [props.open]);
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
            defaultValue={props.createStartDate.toString()}
            fullWidth
            InputProps={{
              readOnly: true,
            }}
          />
          <TextField
            margin="dense"
            id="end"
            label="Selected end time"
            defaultValue={props.createEndDate.toString()}
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
        { tabIndex === 1 &&
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
        <List>
          <h4>Manage Event Members</h4>
          {
            
            friendList.slice().sort(compare).map((friend) => {
              return (
              <ListItem button key={friend.id} onClick={handleEventMemberToggle(friend.id)}>
              {!friend.status && <ListItemIcon>
                      <IconButton aria-label="accept"onClick={()=>handleAddMember(friend)}>
                                <AddIcon  />
                      </IconButton>
              </ListItemIcon>}
              {friend.status && <ListItemIcon>
                      <IconButton aria-label="accept" onClick={()=>handleRemoveMember(friend)}>
                                <RemoveIcon  />
                      </IconButton>
              </ListItemIcon>}
              <ListItemText primary={`${friend.firstName} ${friend.lastName} ${friend.status}`} secondary={friend.username}/>
              </ListItem>
              
              )
            })
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
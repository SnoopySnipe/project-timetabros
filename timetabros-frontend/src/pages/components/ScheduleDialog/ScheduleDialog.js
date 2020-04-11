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
import Switch from '@material-ui/core/Switch';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';
import { getFriends } from '../../../services/FriendService';
import { getUser } from '../../../services/UserService';
import { getGroups, getGroup } from '../../../services/GroupService';
import AuthContext from '../../../context/AuthContext';
import GroupDialog from '../GroupDialog/GroupDialog';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import Popover from '@material-ui/core/Popover';
import moment from 'moment';
import { addEventMember, removeEventMember, createEventItem, updateEventItem, updateEventStatus, getEventItem } from '../../../services/ScheduleService';
const ScheduleDialog = (props) => {
  const context = useContext(AuthContext);
  const [tabIndex, setTabIndex] = React.useState(0);
  const [eventName, setEventName] = React.useState('');
  const [eventDescription, setEventDescription] = React.useState('');
  const [uninvitedFriendList, setUninvitedFriendList] = React.useState([]);
  const [groupList, setGroupList] = React.useState([]);
  const [groupId, setGroupId] = React.useState('none');
  const [statusToEvent, setStatusToEvent] = React.useState('');
  const [eventMembers, setEventMembers] = React.useState([]);
  const [isCourse, setIsCourse] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  const handleSelectGroup = event => {
    setGroupId(event.target.value);
  }
  const handleSubmit = () => {
    if (props.eventToUpdate) {
      handleUpdateEvent();
    } else {
      handleCreateEvent();
    }
  }
  const handleCreateEvent = () => {
    let eventCreatorStatus = '';
    let eventmembers = '';
    if (tabIndex === 1) {
      eventCreatorStatus = 'going';
      eventmembers= JSON.stringify([{ Userid: context.authenticatedUser._id, status: eventCreatorStatus }]);
    }
    createEventItem(eventName, props.createStartDate, props.createEndDate, eventmembers, eventDescription, eventCreatorStatus, tabIndex === 0 && isCourse ? 1 : 0).then(
      (response) => {
        const eventId = response.data._id;
        if (tabIndex === 1 && groupId !== 'none') {
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
    if (!newStatus) return;
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
    addEventMember(props.eventToUpdate.id, friend._id).then(() => {
      handleMemberUpdate();
    });
  }

  const handleRemoveMember = (eventmember) => {
    removeEventMember(props.eventToUpdate.id, eventmember._id).then(() => {
      handleMemberUpdate();
    });
  }

  const handleMemberUpdate = () => {
    getEventItem(props.eventToUpdate.id).then(
      (res) => {
        fetchMembers(res.data.eventmembers || []);
      }
    )
    props.handleCreated();
  }

  const fetchMembers = (eventMembers) => {
    const members = eventMembers || [];
    const memberPromises = [];
    const memberStatuses = [];
    let newEventMembers = [];
    members.forEach(
      (member) => {
        const userId = member.userid;
        if (userId === context.authenticatedUser._id) return;
        memberPromises.push(getUser(userId));
        memberStatuses.push(member.status);
      }
    );
    Promise.all(memberPromises).then(
      (responses) => {
        for (let i = 0; i < responses.length; i++) {
          const user = responses[i].data;
          user.status = memberStatuses[i];
          newEventMembers = newEventMembers.concat(user);
        }
        if (props.eventToUpdate.createdby === context.authenticatedUser._id) {
          getFriends(context.authenticatedUser._id).then((response) => {
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
                  setEventMembers(newEventMembers);
                  setUninvitedFriendList(newUninvitedFriends);
                }
              )
          });
        } else {
          setEventMembers(newEventMembers);
        }
      }
    );
  }

  useEffect(() => {
    if (!props.open) return;
    setEventName('');
    setEventDescription('');
    setStatusToEvent('');
    setUninvitedFriendList([]);
    setEventMembers([]);
    setIsCourse(false);
    if (props.eventToUpdate) {
      setTabIndex(props.eventToUpdate.creatorstatus ? 1 : 0);
      setEventName(props.eventToUpdate.name);
      setEventDescription(props.eventToUpdate.description);
      setIsCourse(props.eventToUpdate.iscobalt === 1? true : false)
      const eventmembers = props.eventToUpdate.eventmembers || [];
      const foundEventMember = eventmembers.find(
        (member) => member.userid === context.authenticatedUser._id
      );
      if (foundEventMember) setStatusToEvent(foundEventMember.status);
      fetchMembers(props.eventToUpdate.eventmembers || []);
    }
    getGroups(context.authenticatedUser._id).then(
      (response) => {
        const ownedGroups = response.data.userownedgroups || [];
        const memberGroups = response.data.usermembergroups || [];
        setGroupList(ownedGroups.concat(memberGroups));
      }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open, props.eventToUpdate, context.authenticatedUser, props.eventToUpdate ? props.eventToUpdate.eventmembers : null]);
  const ownsEvent = !props.eventToUpdate || props.eventToUpdate.createdby === context.authenticatedUser._id;
  function compare(a, b) {
    if (a._id > b._id) return 1;
    if (b._id > a._id) return -1;

    return 0;
  }
  const isRecurTab = props.eventToUpdate && props.eventToUpdate.creatorstatus;
  const isEventTab = props.eventToUpdate && !props.eventToUpdate.creatorstatus;
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  return (
    props.open &&
    <div>

      <Dialog disableBackdropClick open={props.open} onClose={props.handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{props.eventToUpdate ? 'Event Update' : 'Event Creation'}</DialogTitle>
        <Tabs
          value={tabIndex}
          onChange={(e, newVal) => setTabIndex(newVal)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab disabled={isRecurTab} label="Recurring Weekly Item" {...a11yProps(0)} />
          <Tab disabled={isEventTab} label="Personal/Group Event Item"{...a11yProps(1)} />
        </Tabs>

        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label={isCourse && tabIndex === 0 ? "Course Code" : "Name"}
            value={eventName}
            onChange={(event) => setEventName(event.target.value)}
            fullWidth
          />
          {
            tabIndex === 0 &&
            <div>
              <FormControlLabel
              control={
              <Switch
                checked={isCourse}
                onChange={(e,checked)=>setIsCourse(checked)}
                color="primary"
              />
              }
              label="is course"
              />
              <IconButton  size="small" onClick={(e)=>setAnchorEl(e.currentTarget)}>
                <HelpOutlineIcon />
              </IconButton>
    
              <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={()=>setAnchorEl(null)}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <Typography style={{padding:10}}> Enable this field if you wish to treat this item as a course in our friend recommendation service, for higher accuracy, please enter the course code exactly</Typography>
              </Popover>
            </div>
          }

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
          {tabIndex === 1 && !props.eventToUpdate &&
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
          {ownsEvent &&
            <DialogActions>
              <Button onClick={props.handleClose} color="primary">
                Close
              </Button>
              <Button onClick={handleSubmit} color="primary">
                {props.eventToUpdate ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          }
          {tabIndex === 1 && props.eventToUpdate &&
            <div>
              <h4>Status</h4>
              <ToggleButtonGroup
                value={statusToEvent}
                exclusive
                onChange={handleStatusToEvent}
                style={{ color: 'black' }}
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
              {eventMembers.slice().sort(compare).map(
                (eventmember) =>
                  <ListItem key={eventmember._id}>
                    {props.eventToUpdate.createdby === context.authenticatedUser._id && <ListItemIcon>
                      <IconButton aria-label="decline" onClick={() => handleRemoveMember(eventmember)}>
                        <RemoveIcon />
                      </IconButton>
                    </ListItemIcon>}
                    <ListItemText primary={`${eventmember.firstname} ${eventmember.lastname}`} secondary={eventmember.username} />
                    <ListItemSecondaryAction>
                      {eventmember.status}
                    </ListItemSecondaryAction>
                  </ListItem>
              )
              }
              {
                props.eventToUpdate.createdby === context.authenticatedUser._id &&
                uninvitedFriendList.slice().sort(compare).map((friend) => {
                  return (
                    <ListItem key={friend.id}>
                      {props.eventToUpdate.createdby === context.authenticatedUser._id && !friend.status && <ListItemIcon>
                        <IconButton aria-label="accept" onClick={() => handleAddMember(friend)}>
                          <AddIcon />
                        </IconButton>
                      </ListItemIcon>}

                      <ListItemText primary={`${friend.firstname} ${friend.lastname}`} secondary={friend.username} />
                      <ListItemSecondaryAction>
                        {friend.status}
                      </ListItemSecondaryAction>
                    </ListItem>

                  )
                })
              }

            </List>}
        </DialogContent>
        {!ownsEvent &&
          <DialogActions>
            <Button onClick={props.handleClose} color="primary">
              Close
          </Button>
          </DialogActions>
        }
      </Dialog>
      <GroupDialog open={false}></GroupDialog>
    </div>
  );
}

export default ScheduleDialog;
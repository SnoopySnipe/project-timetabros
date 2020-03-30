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
import AuthContext from '../../../context/AuthContext';

const GroupDialog = (props) => {
    const context = useContext(AuthContext);
    const [isRecurring, setIsRecurring] = React.useState(true);
    const [isGroupEvent, setIsGroupEvent] = React.useState(false);
    const [checked, setChecked] = React.useState([]);
    const [friendList, setFriendList] = React.useState([]);
    const handleSelectEventType = event => {
        setIsRecurring(event.target.value);
    }
    const toggleGroupChecked = () => {
        setIsGroupEvent(prev => !prev);
        console.log(isGroupEvent);
    };
      
    useEffect(() => {
        getFriends(context.authenticatedUser._id).then((response) => {
          console.log(response.data.friends);
          if(response.data.friends) response.data.friends.forEach(
              (item) => {
                  const friendId = context.authenticatedUser._id === item.user1 ? item.user2 : item.user1;
                  getUser(friendId).then(
                      (res) => {
                          const user = res.data;
                          setFriendList(friendList => friendList.concat([{
                            id: user._id,
                            firstName: user.firstname,
                            lastName: user.lastname,
                            username: user.username
                          }]));
                       }
                  )
              }
          );
      });
    }, []);
  return (
    props.open &&
    <div>
      {/* <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Open form dialog
      </Button> */}
      <Dialog open={props.open} onClose={props.handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Group Creation</DialogTitle>
        <DialogContent>
          {/* <DialogContentText>
            To subscribe to this website, please enter your email address here. We will send updates
            occasionally.
          </DialogContentText> */}
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            fullWidth
          />
          <TextField
            margin="dense"
            id="description"
            label="Description"
            fullWidth
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
        <InputLabel> Group event <Switch size="small" checked={isGroupEvent} onChange={toggleGroupChecked} /></InputLabel>
        {isGroupEvent &&
        <List>
          {
            friendList.map((friend) => {
              return (
              <ListItem key={friend.id}>
              <ListItemIcon>
                  <Checkbox
                      edge="start"
                      checked={checked.indexOf(friend.id) != -1}
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
          <Button onClick={props.handleClose} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default GroupDialog;
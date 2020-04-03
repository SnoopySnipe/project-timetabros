import React, { useEffect } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import MenuItem from '@material-ui/core/MenuItem';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Alert } from '@material-ui/lab';
import { updateUser } from '../../../services/UserService';
const ProfileDialog = (props) => {
    const [username, setUsername] = React.useState('');
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [profilePrivacy, setProfilePrivacy] = React.useState('public');
    const [schedulePrivacy, setSchedulePrivacy] = React.useState('public');
    const [error, setError] = React.useState('');

    const handleSubmit = () => {
      updateUser(username, firstName, lastName, email, profilePrivacy, schedulePrivacy).then(
        () => {
          setError('');
          props.onUpdate();
          props.handleClose();
        },

      ).catch(error => {
        console.log(error);
            setError(error.response.data.error);
      });
      console.log(props.userToUpdate);
    }
    useEffect(() => {
      if (!props.open) return;
      setUsername('');
      setFirstName('');
      setLastName('');
      setEmail('');
      if(props.userToUpdate) {
        setUsername(props.userToUpdate.username);
        setFirstName(props.userToUpdate.firstname);
        setLastName(props.userToUpdate.lastname);
        setEmail(props.userToUpdate.email);
      }

    }, [props.open]);
    return (
        props.open && props.userToUpdate &&
        <div>
          {/* <Button variant="outlined" color="primary" onClick={handleClickOpen}>
            Open form dialog
          </Button> */}
          <Dialog disableBackdropClick open={props.open} onClose={props.handleClose} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Profile Edit</DialogTitle>
            <DialogContent>
              {/* <DialogContentText>
                To subscribe to this website, please enter your email address here. We will send updates
                occasionally.
              </DialogContentText> */}
              <TextField
                autoFocus
                margin="dense"
                id="firstName"
                label="First Name"
                fullWidth
                value={firstName}
                onChange={(event)=>{setFirstName(event.target.value)}}
              />
              <TextField
                margin="dense"
                id="lastName"
                label="Last Name"
                fullWidth
                value={lastName}
                onChange={(event)=>{setLastName(event.target.value)}}
              />
              <TextField
                margin="dense"
                id="username"
                label="Username"
                fullWidth
                value={username}
                onChange={(event)=>{setUsername(event.target.value)}}
              />
              <TextField
                margin="dense"
                id="email"
                label="Email"
                fullWidth
                value={email}
                onChange={(event)=>{setEmail(event.target.value)}}
              />
              {
                error && 
                <Alert variant="outlined" severity="error">
                    {error}
                </Alert>
              }
            </DialogContent>

            <DialogActions>
              <Button onClick={props.handleClose} color="primary">
                Cancel
              </Button>
              <Button onClick={handleSubmit} color="primary">
                Update
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      );

}

export default ProfileDialog;
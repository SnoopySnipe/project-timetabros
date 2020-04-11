import React, { useEffect } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import { Alert } from '@material-ui/lab';
import { updateUser } from '../../../services/UserService';
import {  withRouter } from "react-router-dom";

const ProfileDialog = (props) => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [prevEmail, setPrevEmail] = React.useState('');
    const [profilePicture, setProfilePicture] = React.useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = React.useState(null);
    const [error, setError] = React.useState('');
    const handleFileSelect = (event) => {
      setProfilePicturePreview(URL.createObjectURL(event.target.files[0]));
      setProfilePicture(event.target.files[0]);
    }
    const handleSubmit = () => {
      updateUser(username, password, firstName, lastName, email, profilePicture).then(
        (response) => {
          setError('');
          if(response.data.email !== prevEmail) props.signOut('/landing/signin', 'cb=email-change');
          else {
            props.onUpdate();
            props.handleClose();
          }
        },

      ).catch(error => {
            setError(error.response.data.error);
      });
    }
    useEffect(() => {
      if (!props.open) return;
      setUsername('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPrevEmail('');
      if(props.userToUpdate) {
        setProfilePicturePreview(`${process.env.REACT_APP_API_URL}/api/users/${props.userToUpdate._id}/pfp`);
        setUsername(props.userToUpdate.username);
        setFirstName(props.userToUpdate.firstname);
        setLastName(props.userToUpdate.lastname);
        setEmail(props.userToUpdate.email);
        setPrevEmail(props.userToUpdate.email);
      }

    }, [props.open, props.userToUpdate]);
    return (
        props.open && props.userToUpdate &&
        <div>
          {/* <Button variant="outlined" color="primary" onClick={handleClickOpen}>
            Open form dialog
          </Button> */}
          <Dialog disableBackdropClick open={props.open} onClose={props.handleClose} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Profile Edit</DialogTitle>
            <DialogContent>
              <Grid container spacing={4} justify="center" alignItems="center">

                    <Grid item xs={12} md={3} >
                      <Avatar src={profilePicturePreview} style={{width:'100px', height:'100px'}}>{firstName.charAt(0).toUpperCase()}</Avatar>
                      <input
                        accept="image/*"
                        id="contained-button-file"
                        multiple
                        type="file"
                        style={{display:'none'}}
                        onChange={handleFileSelect}
                      />
                      <label htmlFor="contained-button-file">
                        <Button variant="contained" color="primary" component="span">
                          Upload
                        </Button>
                      </label>


                    </Grid>
                    <Grid item xs={12} md={8}>
                        
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
                        id="password"
                        label="Password"
                        type="password"
                        fullWidth
                        value={password}
                        helperText="Leave blank if password does not need to be updated"
                        onChange={(event)=>{setPassword(event.target.value)}}
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
                    </Grid>


                </Grid>

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

export default withRouter(ProfileDialog);
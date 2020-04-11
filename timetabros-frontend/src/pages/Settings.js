import React, { useEffect, useContext }from 'react';
import AuthContext from '../context/AuthContext';
import { getUser, updateUserPrivacy } from '../services/UserService';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
const Settings = () => {
    const context = useContext(AuthContext);
    const [schedulePrivacy, setSchedulePrivacy] = React.useState('public');
    const [profilePrivacy, setProfilePrivacy] = React.useState('public');
    const [changed, setChanged] = React.useState(false);
    useEffect(
        () => {
            getUser(context.authenticatedUser._id).then(
                (response) => {
                    setSchedulePrivacy(response.data.privacysettings.schedule);
                    setProfilePrivacy(response.data.privacysettings.profile);
                }
            )
        }, [context.authenticatedUser]
    );

    const handleSelectProfilePrivacy = (e) => {
        setProfilePrivacy(e.target.value);
        setChanged(true);
    }

    const handleSelectSchedulePrivacy = (e) => {
        setSchedulePrivacy(e.target.value);
        setChanged(true);
    }

    const handleSubmit = () => {
        updateUserPrivacy(profilePrivacy, schedulePrivacy).then(
            (response) => {
                setSchedulePrivacy(response.data.privacysettings.schedule);
                setProfilePrivacy(response.data.privacysettings.profile);
            }
        )
        setChanged(false);
    }

    return (
        <div>
            <Grid container direction="column" alignItems="center" spacing={4}>
                <Grid item>
                    <TextField
                    fullWidth
                    id="item-type"
                    select
                    label="Profile Privacy"
                    value={profilePrivacy}
                    onChange={handleSelectProfilePrivacy}
                    helperText="Choose who can see your friends and groups"
                    >

                    <MenuItem value={'public'}>
                    Public
                    </MenuItem>
                    <MenuItem value={'friends-only'}>
                    Friends only
                    </MenuItem>
                    <MenuItem value={'private'}>
                    Private
                    </MenuItem>
                    </TextField>
                </Grid>
                <Grid item>
                    <TextField
                    fullWidth
                    id="item-type"
                    select
                    label="Schedule Privacy"
                    value={schedulePrivacy}
                    onChange={handleSelectSchedulePrivacy}
                    helperText="Choose who can see your schedule"
                    >

                    <MenuItem value={'public'}>
                    Public
                    </MenuItem>
                    <MenuItem value={'friends-only'}>
                    Friends only
                    </MenuItem>
                    <MenuItem value={'private'}>
                    Private
                    </MenuItem>
                    </TextField>
                </Grid>
                {changed &&
                <Grid item>
                    <Button variant="contained" onClick={handleSubmit} color="primary">
                        Update
                    </Button>
                </Grid>
                }

            </Grid>
        </div>

    )
}

export default Settings;
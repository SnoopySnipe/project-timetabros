import React from 'react';
import Calendar from './components/Calendar/Calendar';
import { withRouter } from "react-router-dom";
import { getUser, getProfilePicture } from '../services/UserService';
import AuthContext from '../context/AuthContext';
import { Button, Avatar, Grid } from '@material-ui/core';
import ProfileDialog from './components/ProfileDialog/ProfileDialog';
class Profile extends React.Component {
    static contextType = AuthContext;
    constructor(props){
        super(props);
        this.state = {
            user: null,
            canEdit: false,
            openProfileEdit: false,
            profilePicture: '',
            profilePictureHash: ''
            // profilePictureAlt: '',
        }
    }
    fetchUser() {
        let id = this.props.match.params.id;
        if(!id || id === this.context.authenticatedUser._id) {
            id = this.context.authenticatedUser._id;
            this.setState({canEdit: true});
        }
        console.log(id);
        if(id) {
            getUser(id).then(
                (response) => {
                    this.setState({user: response.data, profilePictureAlt: response.data.firstname.charAt(0)});
                }
            )
            this.setState({profilePicture: `http://localhost:3001/api/users/${id}/pfp`, profilePictureHash: Date.now()});
        }
    }
    componentWillMount() {
        this.fetchUser();
    }
    render(){
        if (!this.state.user) {
            return <div />
        }
        return(
            
            <div>
                <ProfileDialog userToUpdate={this.state.user} open={this.state.openProfileEdit} handleClose={()=>{this.setState({openProfileEdit: false})}} onUpdate={()=>{this.fetchUser()}}></ProfileDialog>
                <Grid direction='column' container alignItems="center">
                    <Grid item xs={12}>
                        <Avatar style={{height:'100px', width: '100px'}} src={`${this.state.profilePicture}?${this.state.profilePictureHash}`}>{this.state.user.firstname.charAt(0).toUpperCase()}</Avatar>
                    </Grid>
                    <Grid item xs={12}>
                        <h1>{`${this.state.user.firstname} ${this.state.user.lastname} (${this.state.user.username})`}
                        </h1>
                    </Grid>
                    <Grid item xs={12}>
                    {this.state.canEdit && <Button variant="outlined" size="small" onClick={()=>{this.setState({openProfileEdit: true})}}>Edit Profile</Button> }

                    </Grid>

                </Grid>
                

               
                <Calendar users={[{id: this.state.user._id}]} canEdit={this.state.canEdit}/>
            </div>
            
        )
    }

}

export default withRouter(Profile);
/*
export default function Profile() {
    return(
        <h1>SCHEDULE</h1>
    )
}
*/
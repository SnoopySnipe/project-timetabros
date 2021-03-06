import React from 'react';
import Calendar from './components/Calendar/Calendar';
import { withRouter } from "react-router-dom";
import { getUser} from '../services/UserService';
import AuthContext from '../context/AuthContext';
import { Button, Avatar, Grid } from '@material-ui/core';
import ProfileDialog from './components/ProfileDialog/ProfileDialog';
import FriendsDialog from './components/FriendsDialog/FriendsDialog';
class Profile extends React.Component {
    static contextType = AuthContext;
    constructor(props){
        super(props);
        this.state = {
            user: null,
            canEdit: false,
            openProfileEdit: false,
            openFriendsList: false,
            profilePicture: '',
            profilePictureHash: ''
        }
    }
    fetchUser = (paramId) => {
        let id = paramId;
        if(!id || id === this.context.authenticatedUser._id) {
            id = this.context.authenticatedUser._id;
            this.setState({canEdit: true});
        }
        if(id) {
            getUser(id).then(
                (response) => {
                    this.setState({user: response.data, profilePictureAlt: response.data.firstname.charAt(0)});
                }
            )
            this.setState({profilePicture: `${process.env.REACT_APP_API_URL}/api/users/${id}/pfp`, profilePictureHash: Date.now()});
        }
    }
    componentWillMount() {
        this.fetchUser(this.props.match.params.id);
    }

    render(){
        if (!this.state.user) {
            return <div />
        }
        return(
            
            <div>
                <FriendsDialog open={this.state.openFriendsList} handleClose={()=>this.setState({openFriendsList: false})} userId={this.state.user._id} handleSelectFriend={this.fetchUser}></FriendsDialog>
                <ProfileDialog signOut={this.props.signOut} userToUpdate={this.state.user} open={this.state.openProfileEdit} handleClose={()=>{this.setState({openProfileEdit: false})}} onUpdate={()=>{this.fetchUser()}}></ProfileDialog>
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
                    {!this.state.canEdit && <Button variant="outlined" size="small" onClick={()=>{this.setState({openFriendsList: true})}}>Friends</Button> }
                    </Grid>

                </Grid>
                

               
                <Calendar users={[{id: this.state.user._id}]} canEdit={this.state.canEdit}/>
            </div>
            
        )
    }

}

export default withRouter(Profile);

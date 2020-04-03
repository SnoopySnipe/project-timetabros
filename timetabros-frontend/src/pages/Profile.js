import React from 'react';
import Calendar from './components/Calendar/Calendar';
import { withRouter } from "react-router-dom";
import { getUser } from '../services/UserService';
import AuthContext from '../context/AuthContext';
import { Button } from '@material-ui/core';
import ProfileDialog from './components/ProfileDialog/ProfileDialog';
class Profile extends React.Component {
    static contextType = AuthContext;
    constructor(props){
        super(props);
        this.state = {
            user: null,
            canEdit: false,
            openProfileEdit: false
        }
    }
    fetchUser() {
        let id = this.props.match.params.id;
        if(!id) {
            id = this.context.authenticatedUser._id;
            this.setState({canEdit: true});
        }
        console.log(id);
        if(id) {
            getUser(id).then(
                (response) => {
                    this.setState({user: response.data});
                }
            )
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
                <h1>Schedule of {this.state.user.firstname} {this.state.user.lastname}  {' '}
                    {this.state.canEdit && <Button variant="outlined" size="small" onClick={()=>{this.setState({openProfileEdit: true})}}>Edit Profile</Button> }
                </h1>
               
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
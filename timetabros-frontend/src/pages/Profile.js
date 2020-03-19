import React from 'react';
import Calendar from './components/Calendar/Calendar';
import { withRouter } from "react-router-dom";
import { getUser } from '../services/UserService';
import AuthContext from '../context/AuthContext';

class Profile extends React.Component {
    static contextType = AuthContext;
    constructor(props){
        super(props);
        this.state = {
            user: null,
            canEdit: false
        }
    }
    componentDidMount() {
        let id = this.props.match.params.id;
        console.log(id);
        if(!id) {
            id = this.context.authenticatedUser._id;
            this.setState({canEdit: true});
        }
        if(id) getUser(id).then(
            (response) => {
                this.setState({user: response.data})
                console.log(this.state.user);
            }
        );
    }
    render(){
        if (!this.state.user) {
            return <div />
        }
        return(
            
            <div>
                <h1>SCHEDULE</h1>
                {/* <Calendar targetSchedule="5e692e2cac7ccf00b9e1d71b"/> */}
                
                <Calendar user={this.state.user} targetSchedule=""/>
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
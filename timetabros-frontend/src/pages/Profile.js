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
            userId: null,
            canEdit: false
        }
    }
    componentDidMount() {
        let id = this.props.match.params.id;
        console.log(this.props);
        console.log("Calender UserId");
        console.log(id);
        if(!id) {
            id = this.context.authenticatedUser._id;
            this.setState({canEdit: true});
        }
        console.log(id);
        if(id) this.setState({userId: id});
    }
    render(){
        if (!this.state.userId) {
            return <div />
        }
        return(
            
            <div>
                <h1>SCHEDULE</h1>                
                <Calendar users={[{id: this.state.userId}]} canEdit={this.state.canEdit}/>
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
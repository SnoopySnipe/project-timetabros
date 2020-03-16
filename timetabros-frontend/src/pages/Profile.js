import React from 'react';
import Calendar from './components/Calendar/Calendar';

class Profile extends React.Component {
    constructor(){
        super();
    }

    render(){
        return(
            <div>
                <h1>SCHEDULE</h1>
                {/* <Calendar targetSchedule="5e692e2cac7ccf00b9e1d71b"/> */}
                <Calendar targetSchedule=""/>
            </div>
            
        )
    }

}

export default Profile;
/*
export default function Profile() {
    return(
        <h1>SCHEDULE</h1>
    )
}
*/
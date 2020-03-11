import React from 'react';
import Calendar from './components/Calendar';

class Profile extends React.Component {
    constructor(){
        super();
    }

    render(){
        return(
            <div>
                <h1>SCHEDULE</h1>
                <Calendar />
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
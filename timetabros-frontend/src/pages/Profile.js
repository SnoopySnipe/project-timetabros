import React from 'react';
import Calendar from './components/Calendar/Calendar';

class Profile extends React.Component {
    constructor(){
        super();
        this.submitCalender = this.submitCalender.bind(this);
    }

    submitCalender(){
        console.log("fuck");
        //TODO
    }


    render(){
        return(
            <div>
                <h1>SCHEDULE</h1>
                <Calendar />
                <button onClick={this.submitCalender}>
                    Test
                </button>
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
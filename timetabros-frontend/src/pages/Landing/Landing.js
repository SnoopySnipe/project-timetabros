import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import AuthContext from '../../context/AuthContext';
import styles from './LandingStyles';
import SignIn from '../components/SignIn/SignIn';
import { Route} from 'react-router-dom';
import SignUp from '../components/SignUp/SignUp';
import Intro from '../components/Intro/Intro';
import Reset from '../components/Reset/Reset';
import ResetPassword from '../components/ResetPassword/ResetPassword';
class Landing extends React.Component {
    static contextType = AuthContext;

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.bgContainer}>
                <Route exact path='/landing' component={Intro}/>
                <Route path='/landing/signin' component={SignIn}/>
                <Route path='/landing/signup' component={SignUp}/>
                <Route path='/landing/reset' component={Reset}/>
                <Route path='/landing/resetpassword/:token' component={ResetPassword}/>
            </div>
    
        )
    }
}
export default withStyles(styles)(Landing);

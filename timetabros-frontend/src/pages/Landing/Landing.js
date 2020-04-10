import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import AuthContext from '../../context/AuthContext';
import styles from './LandingStyles';
import SignIn from '../components/SignIn/SignIn';
import { Route} from 'react-router-dom';
import SignUp from '../components/SignUp/SignUp';
import Intro from '../components/Intro/Intro';

class Landing extends React.Component {
    static contextType = AuthContext;

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.bgContainer}>
                <Route exact path='/landing' component={Intro}/>
                <Route path='/landing/signin' component={SignIn}/>
                <Route path='/landing/signup' component={SignUp}/>
            </div>
    
        )
    }
}
export default withStyles(styles)(Landing);

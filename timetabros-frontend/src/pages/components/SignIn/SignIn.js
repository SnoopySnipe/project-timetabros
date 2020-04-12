import React from 'react';
import { Button, Container, TextField, Paper, Grid } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import styles from './SignInStyles';
import AuthContext from '../../../context/AuthContext';
import { withRouter, NavLink } from 'react-router-dom';
import {signIn} from '../../../services/UserService';
class SignIn extends React.Component {
    static contextType = AuthContext;

    state = {
        username: '',
        password: '',
        errored: false,
        error: '',
        emailChanged: false
    };

    handleLogin = (e) => {
        const { history } = this.props;
        e.preventDefault();
        signIn(this.state.username, this.state.password).then(response => {
            this.setState({errored: false, emailChanged: false});
            this.context.setAuthenticatedUser(response.data);
            localStorage.setItem('authenticatedUser', JSON.stringify(response.data));    
            history.push('/home/profile');
        }).catch(error => {
            this.setState({emailChanged: false, errored:true});
            this.setState({error: error.response.data.error});
        });
    }

    componentDidMount() {
        const search = this.props.location.search;
        const params = new URLSearchParams(search);
        const cb = params.get('cb');
        if(cb) {
            if(cb === 'email-change') this.setState({emailChanged: true});
        }
    }

    render() {
        const { classes } = this.props;
        return (
            <Container maxWidth="xs" className={classes.cardContainer}>
            <Paper className={classes.card} elevation={6}>
                <Typography variant="h5">
                    Sign in
                </Typography>
                <form onSubmit={this.handleLogin} className={classes.form}>
                    <TextField value={this.state.username} onChange={(e) => {this.setState({username: e.target.value})}} label="Username or E-mail" variant="outlined" margin="normal" required fullWidth/>
                    <TextField value={this.state.password} onChange={(e) => {this.setState({password: e.target.value})}} label="Password" variant="outlined" margin="normal" type="password" required fullWidth/>
                    {
                    this.state.errored && 
                    <Alert className={classes.alert} variant="outlined" severity="error">
                        {this.state.error}
                    </Alert>
                    }
                    {
                    this.state.emailChanged && 
                    <Alert className={classes.alert} variant="outlined" severity="success">
                        Please check your email to verify your account due to your change in email
                    </Alert>
                    }
                    <Button className={classes.submit} type="submit" variant="outlined" fullWidth>
                        Sign In
                    </Button>
                    <Grid container spacing={2}>
                        <Grid item>
                            <NavLink to='/landing/signup'>
                                Sign up for an account here!
                            </NavLink>
                        </Grid>
                        <Grid item>
                            <NavLink to='/landing/reset'>
                                Forgot password?
                            </NavLink> 
                        </Grid>


                    </Grid>
                    {/* <Link> */}

                    {/* </Link> */}
                </form>
            </Paper>
        </Container>
        )
    }
}

export default withStyles(styles)(withRouter(SignIn));

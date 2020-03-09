import React from 'react';
import { Button, Container, TextField, Link, Paper } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import styles from './SignInStyles';
import AuthContext from '../../context/AuthContext';
import { withRouter, NavLink } from 'react-router-dom';
import {signIn} from '../../services/UserService';
class SignIn extends React.Component {
    static contextType = AuthContext;

    state = {
        username: '',
        password: '',
    };

    handleLogin = (e) => {
        const { history } = this.props;
        console.log(this.context);
        e.preventDefault();
        // setError(null);
        // setLoading(true);
        signIn(this.state.username, this.state.password).then(response => {
          this.context.setAuthenticatedUser(response.data.username);          
          history.push('/home');
        }).catch(error => {
        //   setLoading(false);
        //   if (error.response.status === 401) setError(error.response.data.message);
        //   else setError("Something went wrong. Please try again later.");
        });
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
                    <TextField value={this.state.username} onChange={(e) => {this.setState({username: e.target.value})}} label="Username" variant="outlined" margin="normal" required fullWidth/>
                    <TextField value={this.state.password} onChange={(e) => {this.setState({password: e.target.value})}} label="Password" variant="outlined" margin="normal" type="password" required fullWidth/>
                    <Button className={classes.submit} type="submit" variant="outlined" fullWidth>
                        Sign In
                    </Button>
                    {/* <Link> */}
                        <NavLink to='/signup'>
                            Sign up for an account here!
                        </NavLink>
                    {/* </Link> */}
                </form>
            </Paper>
        </Container>
        )
    }
}

export default withStyles(styles)(withRouter(SignIn));

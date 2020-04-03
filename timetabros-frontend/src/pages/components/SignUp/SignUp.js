import React from 'react';
import { Button, Container, TextField, Paper } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import styles from './SignUpStyles';
import AuthContext from '../../../context/AuthContext';
import { withRouter, NavLink } from 'react-router-dom';
import {signUp, verifyToken} from '../../../services/UserService';
class SignUp extends React.Component {
    static contextType = AuthContext;

    state = {
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        registered: false,
        registrationToken: '',
        errored: false,
        error: ''
    };

    handleLogin = (e) => {
        e.preventDefault();
        signUp(this.state.firstName, this.state.lastName, this.state.email, this.state.username, this.state.password).then(response => {
            this.setState({errored: false});
            verifyToken(response.data.token).then(
                () => {
                    this.setState({registered: true});
                }
            )
        }).catch(error => {
            this.setState({registered: false})
            this.setState({error: error.response.data.error});
            this.setState({errored: true});
        });
    }
    render() {
        const { classes } = this.props;
        return (
            <Container maxWidth="xs" className={classes.cardContainer}>
            <Paper className={classes.card} elevation={6}>
                <Typography variant="h5">
                    Sign Up
                </Typography>
                <form onSubmit={this.handleLogin} className={classes.form}>
                    <TextField helperText='Must be 2-20 characters' value={this.state.firstName} onChange={(e) => {this.setState({firstName: e.target.value})}} label="First Name" variant="outlined" margin="dense" required fullWidth/>
                    <TextField helperText='Must be 2-20 characters' value={this.state.lastName} onChange={(e) => {this.setState({lastName: e.target.value})}} label="Last Name" variant="outlined" margin="dense" required fullWidth/>
                    <TextField value={this.state.email} onChange={(e) => {this.setState({email: e.target.value})}} label="E-mail" variant="outlined" margin="dense" required fullWidth/>
                    <TextField helperText='Must be 3-20 characters' value={this.state.username} onChange={(e) => {this.setState({username: e.target.value})}} label="Username" variant="outlined" margin="dense" required fullWidth/>
                    <TextField helperText='Must be 8-30 characters' value={this.state.password} onChange={(e) => {this.setState({password: e.target.value})}} label="Password" variant="outlined" margin="dense" type="password" required fullWidth/>
                    <Button className={classes.submit} type="submit" variant="outlined" fullWidth>
                        Sign Up
                    </Button>
                    {
                    this.state.registered && 
                    <Alert className={classes.alert} variant="outlined" severity="success">
                        Successfully registered!
                    </Alert>
                    }
                    {
                    this.state.errored && 
                    <Alert className={classes.alert} variant="outlined" severity="error">
                        {this.state.error}
                    </Alert>
                    }
                    {/* <Link> */}
                        <NavLink to='/landing/signin'>
                            Have an account? Sign in here!
                        </NavLink>
                    {/* </Link> */}
                </form>
            </Paper>
        </Container>
        )
    }
}

export default withStyles(styles)(withRouter(SignUp));

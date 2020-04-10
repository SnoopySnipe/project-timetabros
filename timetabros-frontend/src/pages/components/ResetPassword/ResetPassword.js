import React from 'react';
import { Button, Container, TextField, Paper, Grid } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import styles from './ResetPasswordStyles';
import AuthContext from '../../../context/AuthContext';
import { withRouter, NavLink } from 'react-router-dom';
import {resetPassword} from '../../../services/UserService';
class ResetPassword extends React.Component {
    static contextType = AuthContext;

    state = {
        password: '',
    };

    handleReset = (e) => {
        const { history } = this.props;
        e.preventDefault();
        resetPassword(this.props.match.params.token, this.state.password).then(
            (response) => {
                history.push('/landing/signin');
            }
        )
        .catch(error => {
            this.setState({errored:true});
            this.setState({error: error.response.data.error});
        });
    }
    render() {
        const { classes } = this.props;
        return (
            <Container maxWidth="xs" className={classes.cardContainer}>
            <Paper className={classes.card} elevation={6}>
                <Typography variant="h5">
                    Password Reset
                </Typography>
                <form onSubmit={this.handleReset} className={classes.form}>
                    <TextField value={this.state.password} onChange={(e) => {this.setState({password: e.target.value})}} label="Password" variant="outlined" margin="normal" required type="password" fullWidth/>
                    {
                    this.state.errored && 
                    <Alert className={classes.alert} variant="outlined" severity="error">
                        {this.state.error}
                    </Alert>
                    }
                    <Button className={classes.submit} type="submit" variant="outlined" fullWidth>
                        Confirm
                    </Button>
                    <Grid container spacing={2}>
                        <Grid item>
                            <NavLink to='/landing/signin'>
                                Have an account? Sign in here!
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

export default withStyles(styles)(withRouter(ResetPassword));

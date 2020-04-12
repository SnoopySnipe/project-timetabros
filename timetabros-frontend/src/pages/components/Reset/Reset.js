import React from 'react';
import { Button, Container, TextField, Paper, Grid } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import styles from './ResetStyles';
import AuthContext from '../../../context/AuthContext';
import { withRouter, NavLink } from 'react-router-dom';
import {requestResetPassword} from '../../../services/UserService';
class Reset extends React.Component {
    static contextType = AuthContext;

    state = {
        email: '',
        errored: false,
        error: '',
        requested: false
    };

    handleReset = (e) => {
        e.preventDefault();
        requestResetPassword(this.state.email).then(
            () => {
                this.setState({email: '', errored: false, requested:true});
            }
        )
        .catch(error => {
            this.setState({requested: false, errored:true});
            this.setState({error: error.response.data.error});
        });
    }
    render() {
        const { classes } = this.props;
        return (
            <Container maxWidth="xs" className={classes.cardContainer}>
            <Paper className={classes.card} elevation={6}>
                <Typography variant="h5">
                    Password Reset Request
                </Typography>
                <form onSubmit={this.handleReset} className={classes.form}>
                    <TextField value={this.state.email} onChange={(e) => {this.setState({email: e.target.value})}} label="E-mail" variant="outlined" margin="normal" required fullWidth/>
                    {
                    this.state.requested && 
                    <Alert className={classes.alert} variant="outlined" severity="success">
                        Check your e-mail in order to reset your password!
                    </Alert>
                    }
                    {
                    this.state.errored && 
                    <Alert className={classes.alert} variant="outlined" severity="error">
                        {this.state.error}
                    </Alert>
                    }
                    <Button className={classes.submit} type="submit" variant="outlined" fullWidth>
                        Request
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

export default withStyles(styles)(withRouter(Reset));

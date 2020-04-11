import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Button } from '@material-ui/core';
import AuthContext from '../../../context/AuthContext';
import styles from './IntroStyles';
import { Link } from 'react-router-dom';

class Landing extends React.Component {
    static contextType = AuthContext;

    render() {
        const { classes } = this.props;
        return (
                <Grid className={classes.container} container alignItems="center" justify="center">
                    <Grid item>
                        <h1>TimetaBros</h1>
                        <h3>A social scheduler for students, by students.</h3>
                        <Grid container spacing={2}>
                            <Grid item>
                                <Button size="small" variant="contained" component={Link} to='/landing/signin'>
                                    Sign in
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button size="small" variant="contained" component={Link} to='/landing/signup'>
                                    Sign up
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
    
        )
    }
}
export default withStyles(styles)(Landing);


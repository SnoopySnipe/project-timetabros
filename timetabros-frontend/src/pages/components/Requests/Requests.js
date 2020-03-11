import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Container } from '@material-ui/core';
import AuthContext from '../../../context/AuthContext';
import styles from './RequestsStyles';
class Requests extends React.Component {
    static contextType = AuthContext;
    // this.context.authenticatedUser
    render() {
        const { classes } = this.props;
        return  (
            <Container maxWidth="xs">
                <Grid container>
                    <Grid className={classes.request} item xs={12}>
                        yeet
                    </Grid>
                </Grid>
            </Container>

        )
    }
}

export default withStyles(styles)(Requests);
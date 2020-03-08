import React from 'react';
import { AppBar, Toolbar, Button, Container, TextField, FormControlLabel, Checkbox, Grid, Link, Paper } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';
import books from './img/books.jpg';
const useStyles = makeStyles(theme => ({
    card: {
        padding: theme.spacing(4),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: '5%',
    },
    form: {
        width: '100%',
        marginTop: theme.spacing(2),
    },
    submit: {
        margin: theme.spacing(2, 0),
    },
    bgContainer: {
        width: '100vw',
        height: '100vh',
        backgroundImage: `linear-gradient(to bottom, rgba(245, 246, 252, 0.52), rgba(117, 19, 93, 0.73)), url(${books})`,
        backgroundSize: 'cover',
    },
    cardContainer: {
        paddingTop: theme.spacing(8),
    }
}));

export default function Landing(props) {
    const classes = useStyles();
    const handleLogin = () => {
        setError(null);
        setLoading(true);
        axios.post('http://localhost:3001/users/signin', { username: username.value, password: password.value }).then(response => {
        //   setLoading(false);
        //   setUserSession(response.data.token, response.data.user);
          props.history.push('/dashboard');
        }).catch(error => {
        //   setLoading(false);
          if (error.response.status === 401) setError(error.response.data.message);
          else setError("Something went wrong. Please try again later.");
        });
      }
    return (
        <div className={classes.bgContainer}>
            <Container maxWidth="xs" className={classes.cardContainer}>
                <Paper className={classes.card} elevation={6}>
                    <Typography variant="h5">
                        Sign in
                    </Typography>
                    <form className={classes.form}>
                        <TextField label="Username" variant="outlined" margin="normal" required fullWidth/>
                        <TextField label="Password" variant="outlined" margin="normal" type="password" required fullWidth/>
                        <Button className={classes.submit} type="submit" variant="outlined" fullWidth>
                            Sign In
                        </Button>
                        <Link>
                            Sign up for an account here!
                        </Link>
                    </form>
                </Paper>
            </Container>
        </div>

    )
}
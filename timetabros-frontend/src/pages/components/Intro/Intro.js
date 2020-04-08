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
                <Grid className={classes.container} container spacing={4} alignItems="center" justify="center">
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
                    {/* <Grid item>
                        <h1>TimetaBros</h1>
                        <h3>A social scheduler for students, by students.</h3>
                    </Grid> */}
                </Grid>
    
        )
    }
}
export default withStyles(styles)(Landing);
// export default function Landing(props) {
//     const [username, setUsername] = React.useState('')
//     const [password, setPassword] = React.useState('')
//     const classes = useStyles();

//     const handleLogin = event => {
//         console.log(props);
//         event.preventDefault();
//         alert(username);
//         axios.post('http://localhost:3001/signin', { username, password }).then(response => {
//             console.log(response);
//             props.setAuthenticated(true);
//         //   setLoading(false);
//             //   setUserSession(response.data.token, response.data.user);
//             //   props.history.push('/dashboard');
//             }).catch(error => {
//                 alert(error);
//             //   setLoading(false);
//             //   if (error.response.status === 401) setError(error.response.data.message);
//             //   else setError("Something went wrong. Please try again later.");
//             });
//     }

//     // const handleLogin = () => {
//     //     setError(null);
//     //     setLoading(true);
//         // axios.post('http://localhost:3001/users/signin', { username: username.value, password: password.value }).then(response => {
//         // //   setLoading(false);
//         // //   setUserSession(response.data.token, response.data.user);
//         //   props.history.push('/dashboard');
//         // }).catch(error => {
//         // //   setLoading(false);
//         //   if (error.response.status === 401) setError(error.response.data.message);
//         //   else setError("Something went wrong. Please try again later.");
//         // });
//     //   }

//     return (
//         <div className={classes.bgContainer}>
//             <Container maxWidth="xs" className={classes.cardContainer}>
//                 <Paper className={classes.card} elevation={6}>
//                     <Typography variant="h5">
//                         Sign in
//                     </Typography>
//                     <form onSubmit={handleLogin} className={classes.form}>
//                         <TextField value={username} onChange={(e) => {setUsername(e.target.value)}} label="Username" variant="outlined" margin="normal" required fullWidth/>
//                         <TextField value={password} onChange={(e) => {setPassword(e.target.value)}} label="Password" variant="outlined" margin="normal" type="password" required fullWidth/>
//                         <Button className={classes.submit} type="submit" variant="outlined" fullWidth>
//                             Sign In
//                         </Button>
//                         <Link>
//                             Sign up for an account here!
//                         </Link>
//                     </form>
//                 </Paper>
//             </Container>
//         </div>

//     )
// }

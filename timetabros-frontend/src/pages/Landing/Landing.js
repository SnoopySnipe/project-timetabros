import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import AuthContext from '../../context/AuthContext';
import styles from './LandingStyles';
import SignIn from '../components/SignIn/SignIn';
import { Route, Link } from 'react-router-dom';
import SignUp from '../components/SignUp/SignUp';

class Landing extends React.Component {
    static contextType = AuthContext;

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.bgContainer}>
                <Route path='/landing/signin' component={SignIn}/>
                <Route path='/landing/signup' component={SignUp}/>

                <Link to="/landing/signin">Sign in</Link>
                <Link to="/landing/signup">Sign up</Link>
            </div>
    
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

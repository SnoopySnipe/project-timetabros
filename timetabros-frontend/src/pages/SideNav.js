import React, {useContext} from 'react';
import clsx from 'clsx';
import { BrowserRouter as Router, Route, Link, Redirect } from "react-router-dom";
import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import MenuIcon from '@material-ui/icons/Menu';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Schedule from '@material-ui/icons/Schedule';
import People from '@material-ui/icons/People';
import ListItem from '@material-ui/core/ListItem';
import Profile from './Profile';
import Friends from './Friends';
import Requests from './components/Requests/Requests';
import { Container, Button } from '@material-ui/core';
import AuthContext from '../context/AuthContext';
import { signOut } from '../services/UserService';

const drawerWidth = 240;
const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    })
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  title: {
    flexGrow: 1,
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  appBarSpacer: theme.mixins.toolbar,
}));
export default function SideNav() {
  const classes = useStyles();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [title, setTitle] = React.useState('Schedule');
  const context = useContext(AuthContext);
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  const onListItemClick = title => () => {
    setTitle(title);
    setDrawerOpen(false);
  }
  const handleSignOut = () => {
    signOut().then(() => {
      context.setAuthenticatedUser('');
    });
  }

  return (
    <Router>
      <div className={classes.root}>
        <CssBaseline>
          <AppBar position="absolute" className={clsx(classes.appBar, drawerOpen && classes.appBarShift)}>
            <Toolbar className={classes.toolbar}>
              <IconButton
                edge="start"
                className={clsx(classes.menuButton, drawerOpen && classes.menuButtonHidden)}
                onClick={toggleDrawer}
              >
                <MenuIcon></MenuIcon>
              </IconButton>
              <Typography component="h1" variant="h6" className={classes.title}>
                TimetaBros
              </Typography>
              <Button variant="contained" onClick={handleSignOut}>
                Sign out
              </Button>
            </Toolbar>
          </AppBar>
          <Drawer
            variant="permanent"
            classes={{
              paper: clsx(classes.drawerPaper, !drawerOpen && classes.drawerPaperClose),
            }}
            open={drawerOpen}
          >
            <div className={classes.toolbarIcon}>
              <IconButton onClick={toggleDrawer}>
                <ChevronLeftIcon></ChevronLeftIcon>
              </IconButton>
            </div>
            <Divider />
            <List>    <div>
              <ListItem button selected={title==="Schedule"} component={Link} to="/schedule" onClick={onListItemClick('Schedule')}>
                <ListItemIcon>
                  <Schedule></Schedule>
                </ListItemIcon>
                <ListItemText primary="Schedule"></ListItemText>
              </ListItem>
              <ListItem button selected={title==="Friends"} component={Link} to="/friends" onClick={onListItemClick('Friends')}>
                <ListItemIcon>
                  <People></People>
                </ListItemIcon>
                <ListItemText primary="Friends"></ListItemText>
              </ListItem>
              <ListItem button selected={title==="Requests"} component={Link} to="/requests" onClick={onListItemClick('Requests')}>
                <ListItemIcon>
                  <People></People>
                </ListItemIcon>
                <ListItemText primary="Requests"></ListItemText>
              </ListItem>
            </div></List>
            <Divider />
            <List></List>
          </Drawer>
        </CssBaseline>
        <main className={classes.content}>
          <div className={classes.appBarSpacer}/>
            <Container className={classes.container}>
              <Route path="/schedule" component={Profile} />
              <Route path="/friends" component={Friends} />
              <Route path="/requests" component={Requests} />
            </Container>


        </main>
      </div>

    </Router>

  );
}
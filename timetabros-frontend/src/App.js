import React from 'react';
import './App.css';
import SideNav from './pages/SideNav';
import Landing from './pages/Landing/Landing';
import AuthContext from './context/AuthContext';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import axios from 'axios';

axios.defaults.withCredentials = true; 

const App = () => {
  const [authenticatedUser, setAuthenticatedUser] = React.useState('');
  console.log(authenticatedUser);
  return (
    <AuthContext.Provider value = {{authenticatedUser, setAuthenticatedUser}}>
      <BrowserRouter>
        <Switch>       
          <Redirect exact from='/' to='/landing' />   
          {/* <Route path="/home">
            {authenticatedUser ? <SideNav/> : <Redirect to='/landing' />}
          </Route> */}
          {/* Disabled route protection for easier dev */}
          <Route path="/home" component={SideNav}/>
          
          <Route path='/landing' component={Landing}/>
        </Switch>

      </BrowserRouter>

    </AuthContext.Provider>
  );
}

export default App;

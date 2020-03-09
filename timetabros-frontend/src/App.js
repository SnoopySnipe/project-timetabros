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
          {/* <Route path="/home">
            {authenticatedUser ? <SideNav/> : <Redirect to='/' />}
          </Route> */}
          {/* Disabled route protection for easier dev */}
          <Route path="/home">
            <SideNav/>
          </Route>

          <Route path='/' component={Landing}></Route>
        </Switch>

      </BrowserRouter>

    </AuthContext.Provider>
  );
}

export default App;

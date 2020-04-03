import axios from 'axios';

export const signIn = (username, password) => {
    return axios.post('http://localhost:3001/signin', 
    { username, password });
}

export const signUp = (firstname, lastname, email, username, password) => {
    return axios.post('http://localhost:3001/signup',
    {firstname, lastname, email, username, password});
}

export const signOut = () => {
    return axios.get('http://localhost:3001/signout');
}

export const getUser = (userid) => {
    return axios.get(`http://localhost:3001/api/users/${userid}`);
}

export const updateUser = (username, firstname, lastname, email, profileprivacy, scheduleprivacy) => {
    return axios.patch(`http://localhost:3001/api/users`,
    {username, firstname, lastname, email, privacysettings: {profile: profileprivacy, schedule: scheduleprivacy}});
}

export const verifyToken = (token) => {
    return axios.get(`http://localhost:3001/verify/${token}`);
}
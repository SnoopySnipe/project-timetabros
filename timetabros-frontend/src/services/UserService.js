import axios from 'axios';

export const signIn = (username, password) => {
    return axios.post('http://localhost:3001/signin', 
    { username, password });
}

export const signUp = (firstname, lastname, email, username, password) => {
    return axios.post('http://localhost:3001/signup',
    {firstname, lastname, email, username, password});
}
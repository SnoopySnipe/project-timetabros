import axios from 'axios';

export const signIn = (username, password) => {
    return axios.post('http://localhost:3001/signin', 
    { username, password });
}
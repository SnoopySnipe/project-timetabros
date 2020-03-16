import axios from 'axios';

export const sendFriendRequest = (userid) => {
    return axios.post('http://localhost:3001/api/friends', 
    { userid });
}

export const getFriends = (userid) => {
    return axios.get(`http://localhost:3001/api/users/${userid}/friends`);
}

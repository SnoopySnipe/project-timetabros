import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

export const sendFriendRequest = (userid) => {
    return axios.post(`${apiUrl}/api/friends`, 
    { userid });
}

export const acceptFriendRequest = (requestId) => {
    return axios.patch(`${apiUrl}/api/friends/${requestId}`);
}

export const getFriends = (userid) => {
    return axios.get(`${apiUrl}/api/users/${userid}/friends`);
}

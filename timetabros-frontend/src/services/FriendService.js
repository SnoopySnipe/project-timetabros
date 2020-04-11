import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

export const sendFriendRequest = (userid) => {
    return axios.post(`${apiUrl}/api/friends`, 
    { userid });
}

export const removeFriend = (userid) => {
    return axios.delete(`${apiUrl}/api/friends`, 
    {data:{ userid }});
}

export const acceptFriendRequest = (requestId) => {
    return axios.patch(`${apiUrl}/api/friends/${requestId}`);
}

export const getFriends = (userid) => {
    return axios.get(`${apiUrl}/api/users/${userid}/friends`);
}

export const getMutualFriends = () => {
    return axios.get(`${apiUrl}/api/mutual_friend_recommendations`);
}

export const getScheduleFriends = () => {
    return axios.get(`${apiUrl}/api//schedule_friend_recommendations`);
}
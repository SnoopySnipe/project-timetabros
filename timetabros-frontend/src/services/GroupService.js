import axios from 'axios';

export const createGroup = (name, visibility, groupmembers) => {
    return axios.post('localhost:3001/api/groups', 
    {name, visibility, groupmembers});
}

export const getGroup = (groupId) => {
    return axios.get(`http://localhost:3001/api/groups/${groupId}`);
}

export const getGroups = (userId) => {
    return axios.get(`http://localhost:3001/api/users/${userId}/groups`);
}


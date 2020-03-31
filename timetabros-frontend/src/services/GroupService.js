import axios from 'axios';

export const createGroup = (name, about, visibility, groupmembers) => {
    return axios.post('http://localhost:3001/api/groups', 
    {name, about, visibility, groupmembers});
}

export const getGroup = (groupId) => {
    return axios.get(`http://localhost:3001/api/groups/${groupId}`);
}

export const getGroups = (userId) => {
    return axios.get(`http://localhost:3001/api/users/${userId}/groups`);
}

export const updateGroup = (groupId, name, about, visibility) => {
    return axios.patch(`http://localhost:3001/api/groups/${groupId}`, 
    {name, about, visibility});
}
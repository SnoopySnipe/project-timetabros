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

export const acceptGroup = (groupId) => {
    return axios.patch(`http://localhost:3001/api/groups/${groupId}/members`);
}

export const addGroupMember = (groupId, userid) => {
    return axios.post(`http://localhost:3001/api/groups/${groupId}/members`,
    {userid});
}

export const removeGroupMember = (groupId, userid) => {
    return axios.delete(`http://localhost:3001/api/groups/${groupId}/members`,
    { data: {userid}});
}
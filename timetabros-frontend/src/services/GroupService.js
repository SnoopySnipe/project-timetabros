import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;


export const createGroup = (name, about, visibility, groupmembers) => {
    return axios.post(`${apiUrl}/api/groups`, 
    {name, about, visibility, groupmembers});
}

export const removeGroup = (groupId) => {
    return axios.delete(`${apiUrl}/api/groups/${groupId}`);
}

export const getGroup = (groupId) => {
    return axios.get(`${apiUrl}/api/groups/${groupId}`);
}

export const getGroups = (userId) => {
    return axios.get(`${apiUrl}/api/users/${userId}/groups`);
}

export const updateGroup = (groupId, name, about, visibility) => {
    return axios.patch(`${apiUrl}/api/groups/${groupId}`, 
    {name, about, visibility});
}

export const acceptGroup = (groupId) => {
    return axios.patch(`${apiUrl}/api/groups/${groupId}/members`);
}

export const addGroupMember = (groupId, userid) => {
    return axios.post(`${apiUrl}/api/groups/${groupId}/members`,
    {userid});
}

export const removeGroupMember = (groupId, userid) => {
    return axios.delete(`${apiUrl}/api/groups/${groupId}/members`,
    { data: {userid}});
}
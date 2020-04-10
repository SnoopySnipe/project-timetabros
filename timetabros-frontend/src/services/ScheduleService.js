import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

export const createEventItem = (title, startdate, enddate, eventmembers, description, creatorstatus) => {
    return axios.post(`${apiUrl}/api/event_items`, 
    {title, startdate, enddate, description, creatorstatus, eventmembers});
}

export const getEventItems = (userId) => {
    return axios.get(`${apiUrl}/api/users/${userId}/event_items`);
}

export const getEventItem = (eventId) => {
    return axios.get(`${apiUrl}/api/event_items/${eventId}`);
}

export const deleteEventItem = (eventItemId) => {
    return axios.delete(`${apiUrl}/api/event_items/${eventItemId}`);
}

export const updateEventItem = (eventItemId, title, description, startdate, enddate) => {
    return axios.patch(`${apiUrl}/api/event_items/${eventItemId}`, 
    {title, description, startdate, enddate});
}

export const updateEventItemTime = (eventItemId, startdate, enddate) => {
    return axios.patch(`${apiUrl}/api/event_items/${eventItemId}`, 
    {startdate, enddate});
}

export const updateEventItemTitle = (eventItemId, title) => {
    return axios.patch(`${apiUrl}/api/event_items/${eventItemId}`, 
    {title});
}

export const addEventMember = (eventId, userid) => {
    return axios.post(`${apiUrl}/api/event_items/${eventId}/members`, 
    {userid});
}

export const removeEventMember = (eventId, userid) => {
    return axios.delete(`${apiUrl}/api/event_items/${eventId}/members`, 
    { data: {userid}});
}

export const updateEventStatus = (eventId, status) => {
    return axios.patch(`${apiUrl}/api/event_items/${eventId}/members`, 
    {status});
}
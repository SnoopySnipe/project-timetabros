import axios from 'axios';

export const createEventItem = (title, startdate, enddate, description='', creatorstatus='') => {
    return axios.post('http://localhost:3001/api/event_items', 
    {title, startdate, enddate, description, creatorstatus});
}

export const getEventItems = (userId) => {
    return axios.get(`http://localhost:3001/api/users/${userId}/event_items`);
}

export const deleteEventItem = (eventItemId) => {
    return axios.delete(`http://localhost:3001/api/event_items/${eventItemId}`);
}

export const updateEventItem = (eventItemId, title, description, startdate, enddate) => {
    return axios.patch(`http://localhost:3001/api/event_items/${eventItemId}`, 
    {title, description, startdate, enddate});
}

export const updateEventItemTime = (eventItemId, startdate, enddate) => {
    return axios.patch(`http://localhost:3001/api/event_items/${eventItemId}`, 
    {startdate, enddate});
}

export const updateEventItemTitle = (eventItemId, title) => {
    return axios.patch(`http://localhost:3001/api/event_items/${eventItemId}`, 
    {title});
}

export const addEventMember = (eventId, userid) => {
    console.log('yeet');
    return axios.post(`http://localhost:3001/api/event_items/${eventId}/members`, 
    {userid});
}

export const removeEventMember = (eventId, userid) => {
    return axios.delete(`http://localhost:3001/api/event_items/${eventId}/members`, 
    { data: {userid}});
}

export const updateEventStatus = (eventId, status) => {
    console.log(status);
    return axios.patch(`http://localhost:3001/api/event_items/${eventId}/members`, 
    {status});
}
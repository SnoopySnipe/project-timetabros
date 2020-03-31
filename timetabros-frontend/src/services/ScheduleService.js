import axios from 'axios';

export const createEventItem = (title, startdate, enddate, description='') => {
    console.log(startdate);
    return axios.post('http://localhost:3001/api/event_items', 
    {title, startdate, enddate, description});
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
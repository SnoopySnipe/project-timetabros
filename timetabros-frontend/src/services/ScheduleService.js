import axios from 'axios';

export const createEventItem = (title, startdate, enddate) => {
    console.log(startdate);
    return axios.post('http://localhost:3001/api/event_items', 
    {title, startdate, enddate});
}

export const getEventItems = (userId) => {
    return axios.get(`http://localhost:3001/api/users/${userId}/event_items`);
}

export const deleteEventItem = (eventItemId) => {
    return axios.delete(`http://localhost:3001/api/event_items/${eventItemId}`);
}
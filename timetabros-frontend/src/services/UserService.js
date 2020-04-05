import axios from 'axios';

export const signIn = (username, password) => {
    return axios.post('http://localhost:3001/signin', 
    { username, password });
}

export const signUp = (firstname, lastname, email, username, password) => {
    return axios.post('http://localhost:3001/signup',
    {firstname, lastname, email, username, password});
}

export const signOut = () => {
    return axios.get('http://localhost:3001/signout');
}

export const getUser = (userid) => {
    return axios.get(`http://localhost:3001/api/users/${userid}`);
}

export const getProfilePicture = (userid) => {
    return axios.get(`http://localhost:3001/api/users/${userid}/pfp`, 
    {responseType: 'blob'}
    );
}

export const updateUser = (username, firstname, lastname, email, profileprivacy, scheduleprivacy, profilepicture) => {
    var bodyFormData = new FormData();
    bodyFormData.append('username', username);
    bodyFormData.append('firstname', firstname);
    bodyFormData.append('lastname', lastname);
    bodyFormData.append('email', email);
    if(profilepicture) bodyFormData.append("profilepicture", profilepicture);
    const privacyJson = {profile: profileprivacy, schedule: scheduleprivacy};
    bodyFormData.append('privacysettings', JSON.stringify(privacyJson));
    return axios.patch(`http://localhost:3001/api/users`,
    bodyFormData, 
    {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
}

export const verifyToken = (token) => {
    return axios.get(`http://localhost:3001/verify/${token}`);
}
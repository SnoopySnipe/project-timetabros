import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

export const signIn = (username, password) => {
    return axios.post(`${apiUrl}/signin`, 
    { username, password });
}

export const signUp = (firstname, lastname, email, username, password) => {
    return axios.post(`${apiUrl}/signup`,
    {firstname, lastname, email, username, password});
}

export const signOut = () => {
    return axios.get(`${apiUrl}/signout`);
}

export const requestResetPassword = (email) => {
    return axios.post(`${apiUrl}/reset`,{email});
}

export const resetPassword = (token, password) => {
    return axios.patch(`${apiUrl}/reset/${token}`,{password});
}

export const getUser = (userid) => {
    return axios.get(`${apiUrl}/api/users/${userid}`);
}

export const getProfilePicture = (userid) => {
    return axios.get(`${apiUrl}/api/users/${userid}/pfp`, 
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
    return axios.patch(`${apiUrl}/api/users`,
    bodyFormData, 
    {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
}

export const updateUserPrivacy = (profileprivacy, scheduleprivacy) => {
    var bodyFormData = new FormData();
    const privacyJson = {profile: profileprivacy, schedule: scheduleprivacy};
    bodyFormData.append('privacysettings', JSON.stringify(privacyJson));
    return axios.patch(`${apiUrl}/api/users`,
    bodyFormData, 
    {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
}

export const verifyToken = (token) => {
    return axios.get(`${apiUrl}/verify/${token}`);
}

export const searchUser = (query) => {
    return axios.get(`${apiUrl}/api/users`, {params: {q: query}});
}
import axios from "axios";
export const axiosInstance = axios.create({

    // Initial header setup might be done here, but dynamic setup is better
    // headers: { authorization: `Bearer ${localStorage.getItem('token')}` }
});

// Define and export the helper function
export const setAuthToken = (token) => {
    if (token) {
        // Set the Authorization header for all future requests using this instance
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        // If logging out, remove the header
        delete axiosInstance.defaults.headers.common['Authorization'];
    }
};
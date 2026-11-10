import axios from 'axios';

import cookies from 'js-cookie';

const request = axios.create({
    baseURL: process.env.REACT_APP_SERVER,
    headers: { 'X-Custom-Header': 'foobar' },
    withCredentials: true,
});

export const requestAuth = async () => {
    const res = await request.get('/api/auth');
    return res.data;
};

export const requestRefreshToken = async () => {
    const res = await request.get('/api/refresh-token', { skipAuthRefresh: true });
    return res.data;
};

export const requestLogout = async () => {
    const res = await request.post('/api/logout');
    return res.data;
};

export const requestGetCart = async () => {
    const res = await request.get('/api/cart');
    return res.data;
};

export const requestAdmin = async () => {
    const res = await request.get('/api/admin');
    return res.data;
};

export const requestChat = async (question) => {
    const res = await request.post('/chat', { question });
    return res.data;
};

export const requestUpdateInfoCart = async (data) => {
    const res = await request.post('/api/update-info-cart', data);
    return res.data;
};

let refreshPromise = null;

request.interceptors.response.use(
    (response) => response, // Trả về nếu không có lỗi
    async (error) => {
        const originalRequest = error.config;

        // Preserve the original 401 when the visitor is not signed in. Returning
        // undefined here makes callers fail later while reading response.data.
        if (
            error.response?.status !== 401 ||
            !originalRequest ||
            originalRequest._retry ||
            originalRequest.skipAuthRefresh
        ) {
            return Promise.reject(error);
        }

        if (!cookies.get('logged')) return Promise.reject(error);

        originalRequest._retry = true;

        try {
            // Share one refresh request among simultaneous 401 responses.
            if (!refreshPromise) {
                refreshPromise = requestRefreshToken().finally(() => {
                    refreshPromise = null;
                });
            }
            await refreshPromise;
            return request(originalRequest);
        } catch (refreshError) {
            cookies.remove('logged');
            localStorage.clear();
            if (window.location.pathname !== '/login') window.location.assign('/login');
            return Promise.reject(refreshError);
        }
    },
);

export default request;

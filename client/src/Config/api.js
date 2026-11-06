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
    const res = await request.get('/api/refresh-token');
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

export const requestPaymentVNPAY = async (data) => {
    const res = await request.post('/api/paymentvnpay', data);
    return res.data;
};

let isRefreshing = false;
let failedRequestsQueue = [];

request.interceptors.response.use(
    (response) => response, // Trả về nếu không có lỗi
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 (Unauthorized) và request chưa từng thử refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    // Gửi yêu cầu refresh token
                    const token = cookies.get('logged');
                    if (!token) {
                        return;
                    }
                    await requestRefreshToken();

                    // Xử lý lại tất cả các request bị lỗi 401 trước đó
                    failedRequestsQueue.forEach((req) => req.resolve());
                    failedRequestsQueue = [];
                } catch (refreshError) {
                    // Nếu refresh thất bại, đăng xuất
                    failedRequestsQueue.forEach((req) => req.reject(refreshError));
                    failedRequestsQueue = [];
                    localStorage.clear();
                    window.location.href = '/login'; // Chuyển về trang đăng nhập
                } finally {
                    isRefreshing = false;
                }
            }

            // Trả về một Promise để retry request sau khi token mới được cập nhật
            return new Promise((resolve, reject) => {
                failedRequestsQueue.push({
                    resolve: () => {
                        resolve(request(originalRequest));
                    },
                    reject: (err) => reject(err),
                });
            });
        }

        return Promise.reject(error);
    },
);

export default request;

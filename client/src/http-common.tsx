import axios from 'axios';
import Cookies from 'universal-cookie';

import {showErrorToast} from './services/ToastService';

const cookies = new Cookies();

const httpInstance = axios.create({
  baseURL: process.env.REACT_APP_SERVER_PATH,
  headers: {
    'Content-type': 'application/json',
  },
});

httpInstance.interceptors.request.use(
    (req) => {
      const userCookies = cookies.get('user');
      if (userCookies != null) {
        req.headers['Authorization'] = userCookies['access_token'];
      }
      return req;
    },
    (err) => {
      return Promise.reject(err);
    },
);

httpInstance.interceptors.response.use(
    (res) => {
      if (res.data.isOwner && !window.location.href.includes('settings')) {
        // Redirect owner to settings page
        window.location.href = 'settings';
      }
      // COMMENTED OUT SO ONLY TOAST IF ERROR
      // if (res.data.message) {
      //     toastService.showToast(res.data.message);
      // }
      return res;
    },
    (err) => {
      if (!err.response) {
        showErrorToast('Server error, no response');
        return Promise.reject(err);
      }
      if (err.response.status >= 500) {
        const message = 'Server Error: ' + err.response.data.message;
        showErrorToast(message);
      } else {
        showErrorToast(err.response.data.message);
      }
      return Promise.reject(err);
    },
);

export default httpInstance;

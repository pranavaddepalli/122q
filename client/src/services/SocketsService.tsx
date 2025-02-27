import io, { Socket } from 'socket.io-client';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

let socket : Socket;
const SOCKET_URL = process.env.REACT_APP_PROTOCOL + '://' + process.env.REACT_APP_DOMAIN;
const SOCKET_PATH = process.env.REACT_APP_SOCKET_PATH;

export const initiateSocket = () => {
  if (socket) {
    return;
  }

  socket = io(SOCKET_URL, {path: SOCKET_PATH});

  const userCookies = cookies.get('user');
  if (userCookies != null) {
    socket.emit('authenticate', userCookies.access_token);
  }

  socket.on('disconnect', (reason, details) => {
    console.log('Client disconnected, reconnecting', reason, details);

    setTimeout(() => {
      socket.connect();
    }, 1000);
  });

  socket.on('connect_error', (error) => {
    console.log('Connection error, reconnecting', error.message);
    setTimeout(() => {
      socket.connect();
    }, 1000);
  });

  // dumbass brute force so nginx doesn't kill us
  setInterval(() => {
    socket.emit('ping');
  }, 5000);
};

export const socketSubscribeTo = (emission, callback) => {
  if (!socket) {
    initiateSocket();
  }

  socket.on(emission, (data) => {
    callback(data);
  });
};

export const socketUnsubscribeFrom = (emission) => {
  if (!socket) {
    return;
  }

  socket.off(emission);
};

export const ensureSocketConnected = () => {
  if (!socket) {
    console.log('No existing socket, initiating');
    initiateSocket();
  }

  if (!socket.connected || !socket.active) {
    console.log('Existing socket not connected or inactive, reconnecting');
    socket.connect();
  }
};

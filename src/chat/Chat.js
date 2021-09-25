import { v4 as uuidv4 } from 'uuid';
const messages = new Set();
const users = new Map();

const defaultUser = {
  id: '1',
  name: 'Anonmous',
};

const messageExpirationTimeMS = 5 * 60 * 1000;

class Connection {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;

    socket.on('getMessages', () => this.getMessages());
    socket.on('message', (value) => this.handleMessage(value));
    socket.on('disconnect', () => this.disconnect);
    socket.on('connect_error', (err) => {
      console.log(`error: ${err.message}`);
    });
  }

  sendMessage(message) {
    this.io.socket.emit('message', message);
  }

  getMessages() {
    messages.forEach((message) => this.sendMessage(message));
  }

  handleMessage(value) {
    const message = {
      id: uuidv4(),
      user: users.get(this.socket) || defaultUser,
      value,
      time: Date.now(),
    };
    setTimeout(() => {
      messages.delete(message);
      this.io.sockets.emit('deleteMessage', message.id);
    }, messageExpirationTimeMS);
  }

  disconnect() {
    users.delete(this.socket);
  }
}

const chat = (io) => {
  io.on('connection', (socket) => {
    new Connection(io, socket);
  });
};

export default chat;

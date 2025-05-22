const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {
  generateMessage,
} = require('./utils/messages');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));

// Dictionary to store socket-to-username mapping for enhanced logging
const socketUserMap = {};

// ***** Handles new WebSocket connections
io.on('connection', (socket) => {
  console.log(`New WebSocket Connection established: ${socket.id}`);

  // Handles joining a chat room
  socket.on('join', ({ username, room }, callback) => {
    // Trim and sanitize inputs
    const trimmedUsername = username.trim();
    const trimmedRoom = room.trim();

    if (!trimmedUsername || !trimmedRoom) {
      return callback('Username and room are required.');
    }

    // Add user
    const { error, user } = addUser({ id: socket.id, username: trimmedUsername, room: trimmedRoom });

    if (error) {
      console.error(`JOIN ERROR - Socket ID: ${socket.id}, Username: ${trimmedUsername}, Room: ${trimmedRoom}, Error: ${error}`);
      return callback(error);
    }

    // Store socket to username mapping
    socketUserMap[socket.id] = user.username;
    console.log(`User "${user.username}" joined room "${user.room}" (Socket ID: ${socket.id})`);

    // Join the Socket.IO room
    socket.join(user.room);

    // Send a welcome message to the new user
    socket.emit(
      'message',
      generateMessage(`Admin Bot 🤖`, `Welcome to the chat, ${user.username}! 🎉`)
    );

    // Notify other users in the room about the new user
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        generateMessage(`Admin Bot 🤖`, `${user.username} has joined the room. 👋`)
      );

    // Update room data for all clients in the room
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  // Handles receiving and broadcasting messages
  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    if (!user) {
      return callback('User not found in the system.');
    }

    // Sanitize the message
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return callback('Message cannot be empty.');
    }

    // Check for foul language
    const filter = new Filter();
    if (filter.isProfane(trimmedMessage)) {
      io.to(socket.id).emit('message', generateMessage(`Admin Bot 🤖`, `Please refrain from using inappropriate language. 🙏`));
      return callback('Profanity is not allowed.');
    }

    // Send the message to all clients in the user's room
    io.to(user.room).emit('message', generateMessage(user.username, trimmedMessage));
    console.log(`Message sent by "${user.username}" in room "${user.room}": ${trimmedMessage} (Socket ID: ${socket.id})`);

    // Acknowledge receipt of the message
    callback();
  });

  // Handles user disconnection
  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      console.log(`User "${user.username}" disconnected from room "${user.room}" (Socket ID: ${socket.id})`);
      delete socketUserMap[socket.id];

      // Notify other users in the room about the disconnection
      io.to(user.room).emit(
        'message',
        generateMessage(`Admin Bot 🤖`, `${user.username} has left the room. 🚪`)
      );

      // Update room data for all clients in the room
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    } else {
      console.log(`Socket disconnected: ${socket.id}`);
    }
  });

  // Optional: Add error handling for socket events
  socket.on('error', (error) => {
    console.error(`Socket error for ${socketUserMap[socket.id] || socket.id}:`, error);
  });
});

server.listen(port, () => console.log(`Server is listening on port ${port}`));

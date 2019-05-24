const express = require('express');
const bodyParser = require('body-parser');
const port = process.env.PORT || 8080;

const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);
const mysql_connection = require("./connection/sql_connection");
const userService = require("./utils/services");

// Express Middleware for serving static
// files and parsing the request body
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  extended: true
}));

mysql_connection();
// Start the Server
http.listen(port, function () {
  console.log('Server Started. Listening on *:' + port);
});


// socket functions
io.on('connection', function (socket) {

  socket.on("create", (room) => {
    socket.join(room)
  })

  socket.use(async (sock, next) => {

    const tempToken = socket.handshake.query.token || null;
    if (tempToken) {
      try {
        const decodedData = await userService.decodeSessionToken(tempToken);
        if (decodedData.userID) {
          socket.join(decodedData.userID);
          socket.emit('messageFromServer', {
            message: 'ADDED_SOCKET_CONNECTION'
          });
        } else {
          socket.emit('messageFromServer', {
            message: 'INVALID_TOKEN'
          });
        }
      } catch (error) {
        socket.emit('messageFromServer', {
          message: 'INVALID_TOKEN'
        });
      }
      next();
    } else {
      socket.emit('messageFromServer', {
        message: 'ADDED_SOCKET_CONNECTION'
      });
    }
  });
  
  // Fire 'send' event for updating Message list in UI
  socket.on('new message', async ( room, data) => {
    // io.to(socketData.id).emit('send', socketData);
    const obj = {
      fields: ["user_id", "text"],
      table: "messages",
      values: data
    }

    const message = await userService.submitData(obj);
    io.sockets.in(room).emit('event', data);
  });
  
}); 


// CLIENT FUNCTIONS
const client_io = require('socket.io-client');
const socket = client_io(`http://localhost:${port}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsImlhdCI6MTU1ODY3MTM2NH0.MsFIXy0KxQ7e7HVX1wPdN0G3g5s1J2avs97f1M3bkWM`);
socket.emit("new message", 'room', { user_id: 1, message: "hey" });

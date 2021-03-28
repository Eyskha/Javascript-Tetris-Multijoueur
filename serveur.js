const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

var connectedPlayers = [];

app.use(express.static(__dirname+'/client'));

io.on('connection', (socket) => {
  console.log('user connected');
  connectedPlayers.push(socket.id);
  console.log(connectedPlayers);
  
  socket.emit("user connected", {
    userID: socket.id
  });
  
  socket.on('arena update', data => {
	socket.broadcast.emit('arena player 2', {
		player2arena: data.arena,
		player2joueur: data.joueur,
	});
  });
  
  socket.on('full rows', data => {
	console.log(data);
	socket.broadcast.emit('gift from player 2', {
		nbrows: data.nbrows
	});
  });
  
  socket.on('disconnect', () => {
	console.log('user disconnected');
	connectedPlayers.splice(connectedPlayers.indexOf(socket.id),1);
	console.log(connectedPlayers);
  });
});


http.listen(8080, () => {
  console.log('listening on port 8080');
});
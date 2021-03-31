const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

var connectedPlayers = [];

app.use(express.static(__dirname+'/client'));

io.on('connection', (socket) => {
  console.log('user connected');
  connectedPlayers.push(socket.id);
  console.log("Users connected :",connectedPlayers.length);
    
  socket.emit("user connected", {
    userID: socket.id
  });
  
  socket.on('arena update', data => {
	index = connectedPlayers.indexOf(socket.id);
	if(index%2==0){
		socket.to(connectedPlayers[index+1]).emit('arena player 2', {
			player2arena: data.arena,
			player2joueur: data.joueur,
		});
	}
	else{
		socket.to(connectedPlayers[index-1]).emit('arena player 2', {
			player2arena: data.arena,
			player2joueur: data.joueur,
		});
	}
  });
  
  socket.on('full rows', data => {
	index = connectedPlayers.indexOf(socket.id);
	if(index%2==0){
		socket.to(connectedPlayers[index+1]).emit('gift from player 2', {
		nbrows: data.nbrows
		});
	}
	else{
		socket.to(connectedPlayers[index-1]).emit('gift from player 2', {
		nbrows: data.nbrows
		});
	}
  });
  
  socket.on('defaite', data => {
	index = connectedPlayers.indexOf(socket.id);
	if(index%2==0){
		socket.to(connectedPlayers[index+1]).emit('victoire', {});
	}
	else{
		socket.to(connectedPlayers[index-1]).emit('victoire', {});
	}
  });
  
  socket.on('restart', data => {
	index = connectedPlayers.indexOf(socket.id);
	if(index%2==0){
		socket.to(connectedPlayers[index+1]).emit('restart', {});
	}
	else{
		socket.to(connectedPlayers[index-1]).emit('restart', {});
	}
  });
  
  socket.on('disconnect', () => {
	console.log('user disconnected');
	index = connectedPlayers.indexOf(socket.id);
	connectedPlayers.splice(index,1);
	if(index%2==0){		
		connectedPlayers.push(connectedPlayers.splice(index,1)[0]);
	}
	else{
		connectedPlayers.push(connectedPlayers.splice(index-1,1)[0]);
	}
	console.log("Users connected :",connectedPlayers.length);
	console.log(connectedPlayers);
  });
});


http.listen(8080, () => {
  console.log('listening on port 8080');
});
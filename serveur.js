const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname+'/client'));

io.on('connection', (socket) => {
  console.log('user connected');
  socket.emit('test',{'data': 'this is my data'});
  socket.on('disconnect', () => {
	  console.log('user disconnected');
  });
});


http.listen(8080, () => {
  console.log('listening on port 8080');
});
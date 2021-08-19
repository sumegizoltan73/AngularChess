const express = require('express');
const app = express();
const appIO = express();
const cors = require('cors');

//appIO.use(cors({ origin: 'http://localhost:4200' }));

const http = require('http').Server(appIO);
const io = require('socket.io')(http, {
    cors: {
      origin: "http://localhost:4200"
    }
});

const rooms = {};
const port = process.env.PORT || 8080;
const portIO = process.env.PORT || 8081;

app.use(express.static('./public'));

//app.get('/', (req, res) => res.send('hello!'));

app.get('/', (req, res) => {
    res.sendFile('index.html',{root:__dirname});
});

app.listen(port, () => {
    console.log('listening on *:' + port);
});

http.listen(portIO, () => {
    console.log('io listening on *:' + portIO);
});

io.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
});

io.on('connection', (socket) => {
    socket.on('start-game', (room) => {
        const PIN = getPINForRoom(room);
        const roomId = room + '_' + PIN;
        socket.join(roomId);
        rooms[roomId] = { 
            players: { white: socket.id },
            viewers: [] 
        };
        io.in(roomId).emit('game-created', PIN);
    });
    socket.on('join', (room, PIN, isViewer) => {
        const roomId = room + '_' + PIN;
        if (roomId in rooms) {
            socket.join(roomId);
            if (isViewer === true) {
                rooms[roomId].viewers.push(socket.id);
                io.in(roomId).emit('viewer-joined');
            }
            else {
                if (!('black' in rooms[roomId].players)) {
                    rooms[roomId].players['black'] = socket.id;
                    io.in(roomId).emit('gamer-joined');
                }
                else {
                    socket.emit('invalid-gamer');
                }
            }
        }
        else {
            socket.emit('invalid-room');
        }
    });
});

function getPINForRoom(room){
    let PIN = null;
    let rnd, roomId, tmpPIN;

    while (!PIN) {
        rnd = Math.random();
        tmpPIN = parseInt((rnd * 9999).toString()).toString();
        
        while(tmpPIN.length < 4) {
            tmpPIN = '0' + tmpPIN;
        }

        roomId = room + '_' + tmpPIN;
        
        if (!(roomId in rooms)) {
            PIN = tmpPIN;
        }
    }

    return PIN;
}
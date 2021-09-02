const express = require('express');
const app = express();
const cors = require('cors');

let originUrl = "http://angular-chess.azurewebsites.net";
if (process.env.NODE_ENV === "development") {
    originUrl = "http://localhost:4200";
}

const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
      origin: originUrl
    },
    transports: ["polling", "websocket"]
});

const rooms = {};
const port = process.env.PORT || 8080;

app.use(express.static('./public'));

app.get('/', (req, res) => {
    res.sendFile('index.html',{root:__dirname});
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
            viewers: [],
            isBoardChanged: false
        };
        io.in(roomId).emit('game-created', PIN);
        socket.emit('id', socket.id, false);
    });
    socket.on('join', (room, PIN, isViewer) => {
        const roomId = room + '_' + PIN;
        if (roomId in rooms) {
            socket.join(roomId);
            if (isViewer === true) {
                rooms[roomId].viewers.push(socket.id);
                const isStarted = ('black' in rooms[roomId].players);
                io.in(roomId).emit('viewer-joined', isStarted);
                socket.emit('id', socket.id, rooms[roomId].isBoardChanged);
            }
            else {
                if (!('black' in rooms[roomId].players)) {
                    rooms[roomId].players['black'] = socket.id;
                    io.in(roomId).emit('gamer-joined');
                    socket.emit('id', socket.id, rooms[roomId].isBoardChanged);
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
    socket.on('step', (room, PIN, eventArgs) => {
        const roomId = room + '_' + PIN;
        if (roomId in rooms) {
            rooms[roomId].isBoardChanged = true;
            io.in(roomId).emit('step-to', eventArgs);
        }
    });
    socket.on('convert-pawn', (room, PIN, name, color, step) => {
        const roomId = room + '_' + PIN;
        if (roomId in rooms) {
            io.in(roomId).emit('pawn-converted', name, color, step);
        }
    });
    socket.on('get-board', (room, PIN, socketId) => {
        const roomId = room + '_' + PIN;
        if (roomId in rooms) {
            io.to(rooms[roomId].players.white).emit('get-board-to', socketId);
        }
    });
    socket.on('board', (room, PIN, socketId, board, steps, colorOfNext, isWhiteResigned, isBlackResigned) => {
        const roomId = room + '_' + PIN;
        if (roomId in rooms) {
            io.to(socketId).emit('board-to', board, steps, colorOfNext, isWhiteResigned, isBlackResigned);
        }
    });
    socket.on('board-loaded', (room, PIN, board, steps, colorOfNext, isWhiteResigned, isBlackResigned) => {
        const roomId = room + '_' + PIN;
        if (roomId in rooms) {
            io.in(roomId).emit('board-to-all', board, steps, colorOfNext, isWhiteResigned, isBlackResigned);
        }
    });
    socket.on('message', (room, PIN, player, name, id, message) => {
        const roomId = room + '_' + PIN;
        if (roomId in rooms) {
            io.in(roomId).emit('message-sended', player, name, id, message);
        }
    });

    socket.on('disconnect', () => {
        const userData = getUserData(socket.id);

        if (userData.player) {
            const roomId = userData.roomId;
            const player = userData.player;

            if (player === 'white') {
                delete rooms[roomId].players.white;
            }
            else if (player === 'black') {
                delete rooms[roomId].players.black;
            }
            else {
                const index = rooms[roomId].viewers.indexOf(socket.id);
                rooms[roomId].viewers.splice(index, 1);
            }
            
            if (!(('white' in rooms[roomId].players) && ('black' in rooms[roomId].players))) {
                delete rooms[roomId];
            }
        }
    });
});

http.listen(port);

function getUserData(socketId) {
    const _retVal = {
        roomId: '',
        player: ''
    };

    for (const key in rooms) {
        if (Object.hasOwnProperty.call(rooms, key)) {
            if (!_retVal.roomId) {
                const player = getPlayerType(key, socketId);
                if (player) {
                    _retVal['roomId'] = key;
                    _retVal['player'] = player;
                }
            }
        }
    }

    return _retVal;
}

function getPlayerType(roomId, socketId) {
    if (rooms[roomId].players && rooms[roomId].players.white === socketId) {
        return 'white';
    }
    else if (rooms[roomId].players && rooms[roomId].players.black === socketId) {
        return 'black';
    }
    else if (rooms[roomId].viewers && rooms[roomId].viewers.includes(socketId)) {
        return 'viewer';
    } 

    return null;
}

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

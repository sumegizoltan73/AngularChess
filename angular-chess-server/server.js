const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cors = require('cors');

const rooms = {};

app.use(cors({ origin: 'http://localhost:4200' }));

app.get('/', (req, res) => res.send('hello!'));

http.listen(3000, () => {
    console.log('listening on *:3000');
});

io.on('connection', (socket) => {
    socket.on('start-game', (room) => {
        const PIN = getPINForRoom(room);
        const roomId = room + '_' + PIN;
        socket.join(roomId);
        rooms[roomId].players['white'] = socket.id;
        rooms[roomId].viewers = [];
        socket.to(room).broadcast.emit('game-created', PIN);
    });
    socket.on('join', (room, PIN, isViewer) => {
        const roomId = room + '_' + PIN;
        if (roomId in rooms) {
            socket.join(roomId);
            if (isViewer === true) {
                rooms[roomId].viewers.push(socket.id);
                socket.to(room).broadcast.emit('viewer-joined');
            }
            else {
                if (!('black' in rooms[roomId].players)) {
                    rooms[roomId].players['black'] = socket.id;
                    socket.to(room).broadcast.emit('gamer-joined');
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
import http from 'http'
import express from 'express'
import { Server } from 'socket.io'
import ejs from 'ejs'
import Player from './src/model/Player.js'
import Game from './src/model/Game.js'

const app = express();

const server = http.Server(app).listen(4000);
const io = new Server(server);
const clients = {};

app.use((req, res, next) => { //Cria um middleware onde todas as requests passam por ele 
    if(req.headers["x-forwarder-proto"] == "http")
        res.redirect(`http://${req.headers.host}${req.url}`);
    else
        next();
});

app.use(express.static('./public'));
app.use('/vendor', express.static('./node_modules'));

app.set("views", "./public");
app.set("view engine", "html");
app.engine("html", ejs.renderFile);

app.get("/", (req, res) => {
    return res.render("index.html");
});

const games = {};
let unmatched = null;

io.on("connection", (socket) => {
    let id = socket.id;
    clients[id] = socket;

    socket.on("game.begin", function(data) {
        const game = join(socket, data);
        if(game.player2) {
            console.log("Novo jogo começando. ");

            clients[game.player1.socketId].emit("game.begin", game);
            clients[game.player2.socketId].emit("game.begin", game);
        }
    });

    socket.on("make.move", function (data) {
        const game  = games[socket.id];
        game.board.setCell(data.position, data.symbol);
        game.checkGameOver();
        game.changeTurn();

        const event = game.gameOver ? "gameover" : "move.made";
        clients[game.player1.socketId].emit(event, game);
        clients[game.player2.socketId].emit(event, game);
    });

    socket.on("game.reset", function(data) {
        const game = games[socket.id];
        if(!game)
            return;
        game.board.reset();
        
        clients[game.player1.socketId].emit("game.begin", game);
        clients[game.player2.socketId].emit("game.begin", game);
    });

    socket.on("disconnect", function () {
        const game = games[socket.id];
        if (game){
            const socketEmit = game.player1.socketId == socket.id ? clients[game.player2.socketId] : clients[game.player1.socketId];

            if(socketEmit){
                socketEmit.emit("opponent.left");
            }

            delete games[socket.id];
            delete games[socketEmit.id];
        }
    
        delete clients[id];
    });
});

const join = (socket, data) => {
    const player = new Player(data.playerName, "X", socket.id);

    if(unmatched) {
        unmatched.player2 = player;
        games[unmatched.player1.socketId] = unmatched;
        games[unmatched.player2.socketId] = unmatched;
        unmatched = null;
        
        return games[socket.id];
    }else {
        unmatched = new Game(player);
        return unmatched;
    }
}
import http from 'http'
import express from 'express'
import { Server } from 'socket.io'
import ejs from 'ejs'
import Player from './src/model/Jogadores.js'
import Game from './src/model/Game.js'

const app = express();

const server = http.Server(app).listen(4000);
const io = new Server(server);
const clients = {};

//  Cria uma função minddleware para cada conexão de entrada,
//  verificando se é uma conexão http e redirecionando para a página do jogo.
app.use((req, res, next) => { 
    if(req.headers["x-forwarder-proto"] == "http")
        res.redirect(`http://${req.headers.host}${req.url}`);
    else
        next();
});

app.use(express.static('./public'));
app.use('/node', express.static('./node_modules'));

app.set("views", "./public");
app.set("view engine", "html");
app.engine("html", ejs.renderFile);

app.get("/", (req, res) => {
    return res.render("index.html");
});

const games = {};
let existeJogador = null;

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

    if(existeJogador) {
        existeJogador.player2 = player;
        games[existeJogador.player1.socketId] = existeJogador;
        games[existeJogador.player2.socketId] = existeJogador;
        existeJogador = null;
        
        return games[socket.id];
    }else {
        existeJogador = new Game(player);
        return existeJogador;
    }
}
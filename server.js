import http from 'http'
import express from 'express'
import { Server, Socket } from 'socket.io'
import ejs from 'ejs'

const app = express();

const server = http.Server(app).listen(4000);
const io = new Server(server);
const clients = {};

app.use(express.static('./public'));
app.use('/vendor', express.static('./node_modules'));

app.set("views", "./public");
app.set("view engine", "html");
app.engine("html", ejs.renderFile);

app.get("/", (req, res) => {
    return res.render("index.html");
});

io.on("connection", (socket) => {
    let id = socket.id;
    console.log("Novo cliente conectado: "+id);
    clients[id] = socket;

    socket.on("disconnect", function () {
        console.log("Cliente desconectado: "+id);
        delete clients[id];
    })
})
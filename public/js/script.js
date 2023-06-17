// const socket = io.connect(window.location.origin);
// const Vue = window.vue;
const app = new Vue({
    el: "#app",
    data: {
      socket: null,
      game: null,
      myTurn: null,
      symbol: null,
      playerName: null,
      message: "",
      blockRegister: false,
    },
    methods: {
      startGame() {
        if(!this.playerName){
          this.message = "Insira um nome para iniciar o jogo!";
          return;
        }
        this.message = "Aguardando adversário...";
        this.blockRegister = true;
        this.socket.emit("game.begin", {
          playerName: this.playerName,
        });
      },
      renderTurnMessage() {
        this.message = this.myTurn
          ? "Sua vez de jogar"
          : "Aguarde a vez do adversário";
      },
  
      makeMove(cell) {
        if (!this.myTurn || cell.symbol !== null) return;
        this.socket.emit("make.move", {
          symbol: this.symbol,
          position: this.game._board._cells.indexOf(cell),
        });
      },
  
      resetGame() {
        this.socket.emit("game.reset");
      },
    },
    mounted() {
      this.socket = io.connect(window.location.origin);
  
      const self = this;
  
      this.socket.on("game.begin", function (data) {
        self.game = data;
        const myPlayer =
          data._player1._socketId == self.socket.id
            ? data._player1
            : data._player2;
  
        self.symbol = myPlayer._symbol;
        self.myTurn = data._turnOf == self.symbol;
        self.renderTurnMessage();
      });
  
      this.socket.on("move.made", (data) => {
        self.game = data;
        self.myTurn = data._turnOf == self.symbol;
        self.renderTurnMessage();
      });
  
      this.socket.on("gameover", function (data) {
        self.game = data;
        self.myTurn = false;
        if (self.game._winner) {
          self.message =
            self.game._winner == self.symbol ? "Você ganhou! (*-*)" : "Você perdeu... (-_-)";
        } else {
          self.message = "Jogo empatado.";
        }
      });
  
      this.socket.on("opponent.left", function () {
        self.game = null;
        self.blockRegister = false;
        self.message = "Seu adversário saiu do jogo.";
      });
    },
  });
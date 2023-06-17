class Board {
    constructor() {
      this._cells = [
        { symbol: null },
        { symbol: null },
        { symbol: null },
  
        { symbol: null },
        { symbol: null },
        { symbol: null },
  
        { symbol: null },
        { symbol: null },
        { symbol: null },
      ];
    }
  
    getCell(index) {
      return this._cells[index];
    }
  
    setCell(index, symbol) {
      this._cells[index].symbol = symbol;
    }
  
    get cells() {
      return this._cells;
    }
  
    isGameOver() {
      const matches = ["XXX", "OOO"];
  
      const firstNull = this._cells.findIndex((cell) => cell.symbol == null);
      if (firstNull == -1) {
        return { gameOver: true, winner: null };
      }
  
      const winningConditions = [
        //Linhas
        this.cells[0].symbol + this.cells[1].symbol + this.cells[2].symbol,
        this.cells[3].symbol + this.cells[4].symbol + this.cells[5].symbol,
        this.cells[6].symbol + this.cells[7].symbol + this.cells[8].symbol,
  
        //Colunas
        this.cells[0].symbol + this.cells[3].symbol + this.cells[6].symbol,
        this.cells[1].symbol + this.cells[4].symbol + this.cells[7].symbol,
        this.cells[2].symbol + this.cells[5].symbol + this.cells[8].symbol,
  
        //Diagonais
        this.cells[0].symbol + this.cells[4].symbol + this.cells[8].symbol,
        this.cells[6].symbol + this.cells[4].symbol + this.cells[2].symbol,
      ];
  
      const winningCondition = winningConditions.find((condition) => {
        return condition == matches[0] || condition == matches[1];
      });
  
      if (winningCondition) {
        return {
          gameOver: true,
          winner: winningCondition == matches[0] ? "X" : "O",
        };
      }
  
      return { gameOver: false, winner: null };
    }
  
    reset() {
      this._cells.forEach((cell) => (cell.symbol = null));
    }
  }
  
  export default Board;
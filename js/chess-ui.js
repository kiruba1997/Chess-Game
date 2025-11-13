// Chess UI - Board rendering, interactions, game flow
class ChessUI {
  constructor() {
    this.engine = new ChessEngine();
    this.ai = new ChessAI(this.engine);
    this.selectedSquare = null;
    this.possibleMoves = [];
    this.isPlayerTurn = true;
    this.promotionModal = null;
    
    this.init();
  }

  init() {
    this.createBoard();
    this.setupEventListeners();
    this.render();
  }

  createBoard() {
    const board = document.getElementById('chess-board');
    board.innerHTML = '';
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = document.createElement('div');
        square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
        square.dataset.row = row;
        square.dataset.col = col;
        square.addEventListener('click', () => this.handleSquareClick(row, col));
        board.appendChild(square);
      }
    }
  }

  render() {
    this.renderBoard();
    this.renderCapturedPieces();
    this.renderMoveHistory();
    this.updateStatus();
  }

  renderBoard() {
    const board = this.engine.board;
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (!square) continue;

        square.classList.remove('selected', 'possible-move', 'possible-capture', 'in-check');
        square.innerHTML = '';

        const piece = board[row][col];
        if (piece) {
          const pieceElement = document.createElement('div');
          pieceElement.className = 'piece';
          pieceElement.textContent = piece.type;
          square.appendChild(pieceElement);
        }

        // Highlight selected square
        if (this.selectedSquare && this.selectedSquare.row === row && this.selectedSquare.col === col) {
          square.classList.add('selected');
        }

        // Highlight possible moves
        const possibleMove = this.possibleMoves.find(m => m.row === row && m.col === col);
        if (possibleMove) {
          square.classList.add(possibleMove.type === 'capture' || possibleMove.type === 'en-passant' 
            ? 'possible-capture' 
            : 'possible-move');
        }

        // Highlight king in check
        const pieceAt = board[row][col];
        if (pieceAt && (pieceAt.type === '♔' || pieceAt.type === '♚')) {
          const color = pieceAt.color;
          if (this.engine.inCheck[color]) {
            square.classList.add('in-check');
          }
        }
      }
    }
  }

  renderCapturedPieces() {
    const whiteCaptured = document.getElementById('captured-white');
    const blackCaptured = document.getElementById('captured-black');
    
    whiteCaptured.innerHTML = this.engine.capturedPieces.white.map(p => p.type).join(' ');
    blackCaptured.innerHTML = this.engine.capturedPieces.black.map(p => p.type).join(' ');
  }

  renderMoveHistory() {
    const moveList = document.getElementById('move-list');
    moveList.innerHTML = '';
    
    for (let i = 0; i < this.engine.moveHistory.length; i++) {
      const move = this.engine.moveHistory[i];
      const moveItem = document.createElement('div');
      moveItem.className = 'move-item';
      if (i === this.engine.moveHistory.length - 1) {
        moveItem.classList.add('current');
      }
      moveItem.textContent = `${i + 1}. ${move.notation}`;
      moveList.appendChild(moveItem);
    }
  }

  updateStatus() {
    const statusEl = document.getElementById('game-status');
    const playerEl = document.getElementById('current-player');
    
    if (this.engine.gameOver) {
      if (this.engine.gameOver.type === 'checkmate') {
        statusEl.textContent = `Checkmate! ${this.engine.gameOver.winner === 'white' ? 'You' : 'AI'} wins!`;
      } else {
        statusEl.textContent = 'Stalemate!';
      }
      playerEl.textContent = 'Game Over';
      this.isPlayerTurn = false;
    } else {
      if (this.engine.currentPlayer === 'white') {
        statusEl.textContent = this.engine.inCheck.white ? 'You are in check!' : 'Your turn';
        playerEl.textContent = '⚪ Your turn';
        this.isPlayerTurn = true;
      } else {
        statusEl.textContent = 'AI is thinking...';
        playerEl.textContent = '⚫ AI turn';
        this.isPlayerTurn = false;
      }
    }
  }

  handleSquareClick(row, col) {
    if (!this.isPlayerTurn || this.engine.gameOver) return;
    if (this.engine.currentPlayer !== 'white') return;

    const piece = this.engine.getPiece(row, col);

    // If clicking on own piece, select it
    if (piece && piece.color === 'white') {
      this.selectedSquare = { row, col };
      this.possibleMoves = this.engine.getPossibleMoves(row, col);
      this.renderBoard();
      return;
    }

    // If a square is selected, try to make a move
    if (this.selectedSquare) {
      const move = this.possibleMoves.find(m => m.row === row && m.col === col);
      if (move) {
        this.makePlayerMove(this.selectedSquare.row, this.selectedSquare.col, row, col);
      }
      this.selectedSquare = null;
      this.possibleMoves = [];
      this.renderBoard();
    }
  }

  makePlayerMove(fromRow, fromCol, toRow, toCol) {
    const piece = this.engine.getPiece(fromRow, fromCol);
    const needsPromotion = (piece.type === '♙' || piece.type === '♟') && (toRow === 0 || toRow === 7);

    if (needsPromotion) {
      this.showPromotionModal(fromRow, fromCol, toRow, toCol);
    } else {
      this.executeMove(fromRow, fromCol, toRow, toCol);
    }
  }

  showPromotionModal(fromRow, fromCol, toRow, toCol) {
    // Remove existing modal if any
    if (this.promotionModal) {
      this.promotionModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'promotion-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;

    const options = ['♕', '♖', '♗', '♘'];
    const container = document.createElement('div');
    container.style.cssText = `
      background: var(--card);
      padding: 30px;
      border-radius: 12px;
      display: flex;
      gap: 15px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    `;

    options.forEach(pieceType => {
      const button = document.createElement('button');
      button.textContent = pieceType;
      button.style.cssText = `
        font-size: 3rem;
        width: 80px;
        height: 80px;
        background: var(--light-square);
        border: 3px solid var(--primary);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
      `;
      button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
        button.style.background = 'var(--selected)';
      });
      button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
        button.style.background = 'var(--light-square)';
      });
      button.addEventListener('click', () => {
        this.executeMove(fromRow, fromCol, toRow, toCol, pieceType);
        modal.remove();
        this.promotionModal = null;
      });
      container.appendChild(button);
    });

    modal.appendChild(container);
    document.body.appendChild(modal);
    this.promotionModal = modal;
  }

  executeMove(fromRow, fromCol, toRow, toCol, promotion = null) {
    const success = this.engine.makeMove(fromRow, fromCol, toRow, toCol, promotion);
    if (success) {
      this.render();
      
      // If game continues and it's AI's turn, make AI move after short delay
      if (!this.engine.gameOver && this.engine.currentPlayer === 'black') {
        setTimeout(() => this.makeAIMove(), 500);
      }
    }
  }

  makeAIMove() {
    if (this.engine.gameOver || this.engine.currentPlayer !== 'black') return;

    const move = this.ai.getBestMove();
    if (move) {
      const piece = this.engine.getPiece(move.from.row, move.from.col);
      const needsPromotion = (piece.type === '♙' || piece.type === '♟') && (move.to.row === 0 || move.to.row === 7);
      const promotion = needsPromotion ? '♛' : null; // AI always promotes to queen
      
      this.engine.makeMove(move.from.row, move.from.col, move.to.row, move.to.col, promotion);
      this.render();
    }
  }

  setupEventListeners() {
    document.getElementById('new-game').addEventListener('click', () => {
      this.engine.reset();
      this.selectedSquare = null;
      this.possibleMoves = [];
      this.render();
    });

    document.getElementById('undo-move').addEventListener('click', () => {
      if (this.engine.moveHistory.length === 0) return;
      
      // Undo AI move
      if (this.engine.currentPlayer === 'black') {
        this.engine.undo();
      }
      
      // Undo player move
      this.engine.undo();
      this.selectedSquare = null;
      this.possibleMoves = [];
      this.render();
    });

    document.getElementById('hint-move').addEventListener('click', () => {
      if (this.engine.currentPlayer !== 'white' || this.engine.gameOver) return;
      
      // Get a random legal move as hint
      const allMoves = [];
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = this.engine.getPiece(row, col);
          if (piece && piece.color === 'white') {
            const moves = this.engine.getPossibleMoves(row, col);
            moves.forEach(m => {
              allMoves.push({ from: { row, col }, to: { row: m.row, col: m.col } });
            });
          }
        }
      }
      
      if (allMoves.length > 0) {
        const hint = allMoves[Math.floor(Math.random() * allMoves.length)];
        this.selectedSquare = hint.from;
        this.possibleMoves = [{ row: hint.to.row, col: hint.to.col, type: 'normal' }];
        this.renderBoard();
        
        setTimeout(() => {
          this.selectedSquare = null;
          this.possibleMoves = [];
          this.renderBoard();
        }, 2000);
      }
    });
  }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.chessUI = new ChessUI();
});


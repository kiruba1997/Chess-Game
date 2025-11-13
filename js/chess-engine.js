// Chess Engine - Game logic, move validation, board state
class ChessEngine {
  constructor() {
    this.board = this.initBoard();
    this.currentPlayer = 'white';
    this.moveHistory = [];
    this.capturedPieces = { white: [], black: [] };
    this.enPassantTarget = null;
    this.castlingRights = {
      white: { king: true, queen: true },
      black: { king: true, queen: true }
    };
    this.kingPositions = { white: [7, 4], black: [0, 4] };
    this.inCheck = { white: false, black: false };
    this.gameOver = null;
  }

  initBoard() {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Black pieces
    const blackPieces = ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'];
    for (let col = 0; col < 8; col++) {
      board[0][col] = { type: blackPieces[col], color: 'black' };
      board[1][col] = { type: '♟', color: 'black' };
    }

    // White pieces
    const whitePieces = ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'];
    for (let col = 0; col < 8; col++) {
      board[6][col] = { type: '♙', color: 'white' };
      board[7][col] = { type: whitePieces[col], color: 'white' };
    }

    return board;
  }

  copyBoard(board) {
    return board.map(row => row.map(cell => cell ? { ...cell } : null));
  }

  isValidPosition(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  getPiece(row, col) {
    if (!this.isValidPosition(row, col)) return null;
    return this.board[row][col];
  }

  getAllMoves(fromRow, fromCol, includeIllegal = false) {
    const piece = this.getPiece(fromRow, fromCol);
    if (!piece || piece.color !== this.currentPlayer) return [];

    const moves = [];
    
    switch (piece.type) {
      case '♙': // White pawn
      case '♟': // Black pawn
        moves.push(...this.getPawnMoves(fromRow, fromCol, piece));
        break;
      case '♖': // White rook
      case '♜': // Black rook
        moves.push(...this.getRookMoves(fromRow, fromCol, piece));
        break;
      case '♘': // White knight
      case '♞': // Black knight
        moves.push(...this.getKnightMoves(fromRow, fromCol, piece));
        break;
      case '♗': // White bishop
      case '♝': // Black bishop
        moves.push(...this.getBishopMoves(fromRow, fromCol, piece));
        break;
      case '♕': // White queen
      case '♛': // Black queen
        moves.push(...this.getQueenMoves(fromRow, fromCol, piece));
        break;
      case '♔': // White king
      case '♚': // Black king
        moves.push(...this.getKingMoves(fromRow, fromCol, piece));
        break;
    }

    if (!includeIllegal) {
      return moves.filter(move => this.isLegalMove(fromRow, fromCol, move.row, move.col));
    }
    return moves;
  }

  getPawnMoves(row, col, piece) {
    const moves = [];
    const direction = piece.color === 'white' ? -1 : 1;
    const startRow = piece.color === 'white' ? 6 : 1;

    // Move forward one square
    if (!this.getPiece(row + direction, col)) {
      moves.push({ row: row + direction, col, type: 'normal' });
      
      // Move forward two squares from start
      if (row === startRow && !this.getPiece(row + 2 * direction, col)) {
        moves.push({ row: row + 2 * direction, col, type: 'double-pawn', enPassant: { row: row + direction, col } });
      }
    }

    // Capture diagonally
    for (const colOffset of [-1, 1]) {
      const newCol = col + colOffset;
      const target = this.getPiece(row + direction, newCol);
      if (target && target.color !== piece.color) {
        moves.push({ row: row + direction, col: newCol, type: 'capture' });
      }
      
      // En passant
      if (this.enPassantTarget && 
          this.enPassantTarget.row === row + direction && 
          this.enPassantTarget.col === newCol) {
        moves.push({ row: row + direction, col: newCol, type: 'en-passant' });
      }
    }

    return moves;
  }

  getRookMoves(row, col, piece) {
    const moves = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (const [dRow, dCol] of directions) {
      for (let i = 1; i < 8; i++) {
        const newRow = row + dRow * i;
        const newCol = col + dCol * i;
        if (!this.isValidPosition(newRow, newCol)) break;

        const target = this.getPiece(newRow, newCol);
        if (!target) {
          moves.push({ row: newRow, col: newCol, type: 'normal' });
        } else {
          if (target.color !== piece.color) {
            moves.push({ row: newRow, col: newCol, type: 'capture' });
          }
          break;
        }
      }
    }

    return moves;
  }

  getKnightMoves(row, col, piece) {
    const moves = [];
    const offsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];

    for (const [dRow, dCol] of offsets) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      if (!this.isValidPosition(newRow, newCol)) continue;

      const target = this.getPiece(newRow, newCol);
      if (!target) {
        moves.push({ row: newRow, col: newCol, type: 'normal' });
      } else if (target.color !== piece.color) {
        moves.push({ row: newRow, col: newCol, type: 'capture' });
      }
    }

    return moves;
  }

  getBishopMoves(row, col, piece) {
    const moves = [];
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

    for (const [dRow, dCol] of directions) {
      for (let i = 1; i < 8; i++) {
        const newRow = row + dRow * i;
        const newCol = col + dCol * i;
        if (!this.isValidPosition(newRow, newCol)) break;

        const target = this.getPiece(newRow, newCol);
        if (!target) {
          moves.push({ row: newRow, col: newCol, type: 'normal' });
        } else {
          if (target.color !== piece.color) {
            moves.push({ row: newRow, col: newCol, type: 'capture' });
          }
          break;
        }
      }
    }

    return moves;
  }

  getQueenMoves(row, col, piece) {
    return [...this.getRookMoves(row, col, piece), ...this.getBishopMoves(row, col, piece)];
  }

  getKingMoves(row, col, piece) {
    const moves = [];
    const offsets = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

    for (const [dRow, dCol] of offsets) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      if (!this.isValidPosition(newRow, newCol)) continue;

      const target = this.getPiece(newRow, newCol);
      if (!target) {
        moves.push({ row: newRow, col: newCol, type: 'normal' });
      } else if (target.color !== piece.color) {
        moves.push({ row: newRow, col: newCol, type: 'capture' });
      }
    }

    // Castling
    const side = piece.color;
    const rights = this.castlingRights[side];
    const kingRow = side === 'white' ? 7 : 0;

    if (row === kingRow && col === 4) {
      // King-side castling
      if (rights.king && 
          !this.getPiece(kingRow, 5) && 
          !this.getPiece(kingRow, 6) && 
          !this.isSquareAttacked(kingRow, 4, side) &&
          !this.isSquareAttacked(kingRow, 5, side) &&
          !this.isSquareAttacked(kingRow, 6, side)) {
        const rook = this.getPiece(kingRow, 7);
        if (rook && (rook.type === '♖' || rook.type === '♜') && rook.color === side) {
          moves.push({ row: kingRow, col: 6, type: 'castling-king' });
        }
      }

      // Queen-side castling
      if (rights.queen && 
          !this.getPiece(kingRow, 1) && 
          !this.getPiece(kingRow, 2) && 
          !this.getPiece(kingRow, 3) &&
          !this.isSquareAttacked(kingRow, 4, side) &&
          !this.isSquareAttacked(kingRow, 3, side) &&
          !this.isSquareAttacked(kingRow, 2, side)) {
        const rook = this.getPiece(kingRow, 0);
        if (rook && (rook.type === '♖' || rook.type === '♜') && rook.color === side) {
          moves.push({ row: kingRow, col: 2, type: 'castling-queen' });
        }
      }
    }

    return moves;
  }

  isSquareAttacked(row, col, byColor) {
    const opponent = byColor === 'white' ? 'black' : 'white';
    const originalPlayer = this.currentPlayer;
    this.currentPlayer = opponent;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.getPiece(r, c);
        if (piece && piece.color === opponent) {
          const moves = this.getAllMoves(r, c, true);
          if (moves.some(m => m.row === row && m.col === col)) {
            this.currentPlayer = originalPlayer;
            return true;
          }
        }
      }
    }

    this.currentPlayer = originalPlayer;
    return false;
  }

  isLegalMove(fromRow, fromCol, toRow, toCol) {
    const piece = this.getPiece(fromRow, fromCol);
    if (!piece || piece.color !== this.currentPlayer) return false;

    // Make the move temporarily
    const target = this.getPiece(toRow, toCol);
    const originalBoard = this.copyBoard(this.board);
    const originalEnPassant = this.enPassantTarget;
    const originalKingPos = { ...this.kingPositions };
    const originalCastling = JSON.parse(JSON.stringify(this.castlingRights));

    // Execute move (simplified for check)
    this.board[toRow][toCol] = this.board[fromRow][fromCol];
    this.board[fromRow][fromCol] = null;

    // Update king position if king moved
    if (piece.type === '♔' || piece.type === '♚') {
      this.kingPositions[piece.color] = [toRow, toCol];
    }

    // Check if this move puts own king in check
    const kingPos = this.kingPositions[this.currentPlayer];
    const inCheck = this.isSquareAttacked(kingPos[0], kingPos[1], this.currentPlayer);

    // Restore board
    this.board = originalBoard;
    this.enPassantTarget = originalEnPassant;
    this.kingPositions = originalKingPos;
    this.castlingRights = originalCastling;

    return !inCheck;
  }

  makeMove(fromRow, fromCol, toRow, toCol, promotion = null) {
    const piece = this.getPiece(fromRow, fromCol);
    if (!piece) return false;

    const moves = this.getAllMoves(fromRow, fromCol);
    const move = moves.find(m => m.row === toRow && m.col === toCol);
    if (!move) return false;

    const target = this.getPiece(toRow, toCol);
    const moveNotation = this.getMoveNotation(fromRow, fromCol, toRow, toCol, target);

    // Store state BEFORE making move (for undo)
    const originalPieceType = piece.type;
    const stateBeforeMove = {
      enPassantTarget: this.enPassantTarget ? JSON.parse(JSON.stringify(this.enPassantTarget)) : null,
      castlingRights: JSON.parse(JSON.stringify(this.castlingRights)),
      kingPositions: JSON.parse(JSON.stringify(this.kingPositions))
    };

    // Handle capture
    if (target) {
      this.capturedPieces[target.color].push(target);
    }

    // Handle en passant
    if (move.type === 'en-passant') {
      const capturedPawnRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
      const capturedPawn = this.getPiece(capturedPawnRow, toCol);
      if (capturedPawn) {
        this.capturedPieces[capturedPawn.color].push(capturedPawn);
        this.board[capturedPawnRow][toCol] = null;
      }
    }

    // Handle castling
    if (move.type === 'castling-king') {
      this.board[toRow][5] = this.board[toRow][7];
      this.board[toRow][7] = null;
    } else if (move.type === 'castling-queen') {
      this.board[toRow][3] = this.board[toRow][0];
      this.board[toRow][0] = null;
    }

    // Move piece
    this.board[toRow][toCol] = piece;
    this.board[fromRow][fromCol] = null;

    // Handle pawn promotion
    if ((originalPieceType === '♙' || originalPieceType === '♟') && (toRow === 0 || toRow === 7)) {
      if (promotion) {
        piece.type = promotion;
      } else {
        // Default to queen if no promotion chosen
        piece.type = piece.color === 'white' ? '♕' : '♛';
      }
    }

    // Update king position
    if (piece.type === '♔' || piece.type === '♚') {
      this.kingPositions[piece.color] = [toRow, toCol];
      this.castlingRights[piece.color].king = false;
      this.castlingRights[piece.color].queen = false;
    }

    // Update castling rights
    if (piece.type === '♖' || piece.type === '♜') {
      if (fromRow === (piece.color === 'white' ? 7 : 0)) {
        if (fromCol === 0) this.castlingRights[piece.color].queen = false;
        if (fromCol === 7) this.castlingRights[piece.color].king = false;
      }
    }

    // Set en passant target
    if (move.type === 'double-pawn') {
      this.enPassantTarget = { row: move.enPassant.row, col: move.enPassant.col };
    } else {
      this.enPassantTarget = null;
    }

    // Record move with state BEFORE move (for undo)
    this.moveHistory.push({
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      piece: { type: originalPieceType, color: piece.color }, // Store original piece type before promotion
      captured: target ? { ...target } : null,
      notation: moveNotation,
      castling: move.type.startsWith('castling'),
      castlingType: move.type === 'castling-king' ? 'king' : move.type === 'castling-queen' ? 'queen' : null,
      enPassant: move.type === 'en-passant',
      promotion: (originalPieceType === '♙' || originalPieceType === '♟') && (toRow === 0 || toRow === 7),
      stateBefore: stateBeforeMove
    });

    // Switch player
    this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

    // Check for check/checkmate
    this.updateGameState();

    return true;
  }

  getMoveNotation(fromRow, fromCol, toRow, toCol, captured) {
    const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const fromSquare = cols[fromCol] + (8 - fromRow);
    const toSquare = cols[toCol] + (8 - toRow);
    return fromSquare + (captured ? 'x' : '-') + toSquare;
  }

  updateGameState() {
    const kingPos = this.kingPositions[this.currentPlayer];
    this.inCheck[this.currentPlayer] = this.isSquareAttacked(kingPos[0], kingPos[1], this.currentPlayer);

    // Check for checkmate or stalemate
    const hasLegalMoves = this.hasLegalMoves();
    if (this.inCheck[this.currentPlayer] && !hasLegalMoves) {
      this.gameOver = { type: 'checkmate', winner: this.currentPlayer === 'white' ? 'black' : 'white' };
    } else if (!hasLegalMoves) {
      this.gameOver = { type: 'stalemate' };
    }
  }

  hasLegalMoves() {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.getPiece(row, col);
        if (piece && piece.color === this.currentPlayer) {
          const moves = this.getAllMoves(row, col);
          if (moves.length > 0) return true;
        }
      }
    }
    return false;
  }

  undo() {
    if (this.moveHistory.length === 0) return false;

    const lastMove = this.moveHistory.pop();
    
    // Restore piece to original position (with original type before promotion)
    const restoredPiece = { ...lastMove.piece };
    this.board[lastMove.from.row][lastMove.from.col] = restoredPiece;
    this.board[lastMove.to.row][lastMove.to.col] = lastMove.captured;

    // Restore captured piece if any
    if (lastMove.captured) {
      this.capturedPieces[lastMove.captured.color].pop();
    }

    // Handle castling undo
    if (lastMove.castling) {
      if (lastMove.castlingType === 'king') {
        // King-side
        this.board[lastMove.to.row][7] = this.board[lastMove.to.row][5];
        this.board[lastMove.to.row][5] = null;
      } else if (lastMove.castlingType === 'queen') {
        // Queen-side
        this.board[lastMove.to.row][0] = this.board[lastMove.to.row][3];
        this.board[lastMove.to.row][3] = null;
      }
    }

    // Handle en passant undo
    if (lastMove.enPassant) {
      const capturedRow = lastMove.piece.color === 'white' ? lastMove.to.row + 1 : lastMove.to.row - 1;
      this.board[capturedRow][lastMove.to.col] = lastMove.captured;
    }

    // Restore state from before the move
    if (lastMove.stateBefore) {
      this.enPassantTarget = lastMove.stateBefore.enPassantTarget ? JSON.parse(JSON.stringify(lastMove.stateBefore.enPassantTarget)) : null;
      this.castlingRights = JSON.parse(JSON.stringify(lastMove.stateBefore.castlingRights));
      this.kingPositions = JSON.parse(JSON.stringify(lastMove.stateBefore.kingPositions));
    }

    // Switch player back
    this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

    this.updateGameState();
    return true;
  }

  reset() {
    this.board = this.initBoard();
    this.currentPlayer = 'white';
    this.moveHistory = [];
    this.capturedPieces = { white: [], black: [] };
    this.enPassantTarget = null;
    this.castlingRights = {
      white: { king: true, queen: true },
      black: { king: true, queen: true }
    };
    this.kingPositions = { white: [7, 4], black: [0, 4] };
    this.inCheck = { white: false, black: false };
    this.gameOver = null;
  }

  getPossibleMoves(row, col) {
    return this.getAllMoves(row, col);
  }
}


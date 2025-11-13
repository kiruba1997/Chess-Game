// Simple AI - Prefers captures and better piece positions
class ChessAI {
  constructor(engine) {
    this.engine = engine;
    this.pieceValues = {
      '♙': 1, '♟': 1,
      '♘': 3, '♞': 3,
      '♗': 3, '♝': 3,
      '♖': 5, '♜': 5,
      '♕': 9, '♛': 9,
      '♔': 0, '♚': 0
    };
  }

  getBestMove() {
    const allMoves = this.getAllPossibleMoves();
    if (allMoves.length === 0) return null;

    // Filter moves by simple heuristics
    const captureMoves = allMoves.filter(m => m.captured);
    const safeMoves = allMoves.filter(m => !m.putsInDanger);
    
    // Prefer captures (especially good captures)
    if (captureMoves.length > 0) {
      captureMoves.sort((a, b) => {
        const valueA = this.pieceValues[b.captured.type] || 0;
        const valueB = this.pieceValues[a.captured.type] || 0;
        return valueB - valueA;
      });
      // Return best capture, but sometimes choose randomly from top captures
      if (captureMoves.length > 3) {
        return captureMoves[Math.floor(Math.random() * Math.min(3, captureMoves.length))];
      }
      return captureMoves[0];
    }

    // Prefer safe moves over dangerous ones
    if (safeMoves.length > 0) {
      const randomIndex = Math.floor(Math.random() * safeMoves.length);
      return safeMoves[randomIndex];
    }

    // Otherwise, random legal move
    const randomIndex = Math.floor(Math.random() * allMoves.length);
    return allMoves[randomIndex];
  }

  getAllPossibleMoves() {
    const moves = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.engine.getPiece(row, col);
        if (piece && piece.color === 'black') {
          const pieceMoves = this.engine.getAllMoves(row, col);
          for (const move of pieceMoves) {
            const target = this.engine.getPiece(move.row, move.col);
            moves.push({
              from: { row, col },
              to: { row: move.row, col: move.col },
              captured: target,
              moveType: move.type,
              putsInDanger: this.isMoveDangerous(row, col, move.row, move.col)
            });
          }
        }
      }
    }

    return moves;
  }

  isMoveDangerous(fromRow, fromCol, toRow, toCol) {
    // Simulate the move and check if the square becomes attacked
    const piece = this.engine.getPiece(fromRow, fromCol);
    const target = this.engine.getPiece(toRow, toCol);
    
    // Make move temporarily
    this.engine.board[toRow][toCol] = piece;
    this.engine.board[fromRow][fromCol] = null;
    
    const isDangerous = this.engine.isSquareAttacked(toRow, toCol, 'black');
    
    // Restore
    this.engine.board[fromRow][fromCol] = piece;
    this.engine.board[toRow][toCol] = target;
    
    return isDangerous;
  }
}


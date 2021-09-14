import { Component, h, Fragment, State, getAssetPath, Prop, Listen } from '@stencil/core';
import { Chess, ChessInstance, Piece, ShortMove, Square } from 'chess.js';

interface DndPiece {
  startFile?: number;
  startRank?: number;
  endFile?: number;
  endRank?: number;
  x?: number;
  y?: number;
  piece?: Piece;
}

interface PromotionRequest {
  startFile?: number;
  startRank?: number;
  endFile?: number;
  endRank?: number;
  draggedPieceX?: number;
  draggedPieceY?: number;
}

@Component({
  tag: 'loloof64-chessboard-stencil',
  styleUrl: 'loloof64-chessboard-stencil.css',
  shadow: true,
  assetsDirs: ['assets/chess_vectors'],
})
export class Loloof64ChessboardStencil {
  /** 
  True if and only if the black side is at bottom 
  */
  @Prop() reversed: boolean = false;

  dragLayerElement!: HTMLDivElement;

  @State() logicalBoard: ChessInstance = new Chess();
  @State() dndPieceData: DndPiece = {};
  @State() promotionRequest: PromotionRequest = {};

  getSquareFromCoordinates(file: number, rank: number): Square {
    return (String.fromCharCode('a'.charCodeAt(0) + file) + String.fromCharCode('1'.charCodeAt(0) + rank)) as Square;
  }

  getImageAtCell(col: number, row: number): string {
    const file = this.reversed ? 7 - col : col;
    const rank = this.reversed ? row : 7 - row;

    if (this.dndPieceData) {
      const isDraggedPieceCell = file === this.dndPieceData.startFile && rank === this.dndPieceData.startRank;
      if (isDraggedPieceCell) return;
    }

    const cellAlgebraic = this.getSquareFromCoordinates(file, rank);
    const piece = this.logicalBoard.get(cellAlgebraic);

    if (!piece) return;

    let pieceCode: string;

    switch (piece.type) {
      case 'p':
        pieceCode = piece.color === 'w' ? 'pl' : 'pd';
        break;
      case 'n':
        pieceCode = piece.color === 'w' ? 'nl' : 'nd';
        break;
      case 'b':
        pieceCode = piece.color === 'w' ? 'bl' : 'bd';
        break;
      case 'r':
        pieceCode = piece.color === 'w' ? 'rl' : 'rd';
        break;
      case 'q':
        pieceCode = piece.color === 'w' ? 'ql' : 'qd';
        break;
      case 'k':
        pieceCode = piece.color === 'w' ? 'kl' : 'kd';
        break;
    }

    if (!pieceCode) return;

    const path = `./assets/chess_vectors/Chess_${pieceCode}t45.svg`;
    return getAssetPath(path);
  }

  getLocalCoordinates(event: MouseEvent): Array<number> {
    if (!this.dragLayerElement) return;

    const thisComponentLocation = this.dragLayerElement.getBoundingClientRect();
    const localX = event.clientX - thisComponentLocation.x;
    const localY = event.clientY - thisComponentLocation.y;

    return [localX, localY];
  }

  getCell(x: number, y: number): Array<number> {
    const componentSize = this.dragLayerElement.getBoundingClientRect().width;
    const cellsSize = componentSize * 0.1;
    const cellX = Math.floor((x - cellsSize) / cellsSize);
    const cellY = Math.floor((y - cellsSize) / cellsSize);

    const file = this.reversed ? 7 - cellX : cellX;
    const rank = this.reversed ? cellY : 7 - cellY;

    return [file, rank];
  }

  getPiece(file: number, rank: number): Piece {
    const square = this.getSquareFromCoordinates(file, rank);
    const piece = this.logicalBoard.get(square);
    return piece;
  }

  cancelDragAndDrop() {
    this.dndPieceData = {
      startFile: undefined,
      startRank: undefined,
      endFile: undefined,
      endRank: undefined,
      piece: undefined,
    };
  }

  @Listen('mousedown', { passive: false })
  handleMouseDown(evt: MouseEvent) {
    evt.preventDefault();
    if (this.promotionRequest.startFile) return;

    const componentSize = this.dragLayerElement.getBoundingClientRect().width;
    const cellsSize = componentSize * 0.1;

    const [x, y] = this.getLocalCoordinates(evt);
    const [file, rank] = this.getCell(x, y);

    const piece = this.getPiece(file, rank);
    if (!piece) return;

    this.dndPieceData = {
      startFile: file,
      startRank: rank,
      endFile: undefined,
      endRank: undefined,
      piece,
      x: cellsSize * (this.reversed ? 8 - file : file + 1),
      y: cellsSize * (this.reversed ? rank + 1 : 8 - rank),
    };
  }

  @Listen('mousemove', { passive: false })
  handleMouseMove(evt: MouseEvent) {
    evt.preventDefault();
    if (!this.dndPieceData.piece) return;
    if (this.promotionRequest.startFile) return;

    const [x, y] = this.getLocalCoordinates(evt);
    const [file, rank] = this.getCell(x, y);

    this.dndPieceData = {
      ...this.dndPieceData,
      x,
      y,
      endFile: file,
      endRank: rank,
    };
  }

  @Listen('mouseup', { passive: false })
  handleMouseUp(evt: MouseEvent) {
    evt.preventDefault();
    if (this.promotionRequest.startFile) return;
    if (!this.dndPieceData.piece) return;

    const [x, y] = this.getLocalCoordinates(evt);
    const [targetFile, targetRank] = this.getCell(x, y);

    const { startFile: originFile, startRank: originRank } = this.dndPieceData;

    const originSquare = this.getSquareFromCoordinates(originFile, originRank);
    const targetSquare = this.getSquareFromCoordinates(targetFile, targetRank);

    const boardLogicCopy = new Chess(this.logicalBoard.fen());
    const moveTryResult = boardLogicCopy.move({ from: originSquare, to: targetSquare });

    const isPromotionMove =
      (this.dndPieceData.piece.type === 'p' && this.dndPieceData.piece.color === 'w' && this.dndPieceData.startRank === 6 && this.dndPieceData.endRank === 7) ||
      (this.dndPieceData.piece.type === 'p' && this.dndPieceData.piece.color === 'b' && this.dndPieceData.startRank === 1 && this.dndPieceData.endRank === 0);
    if (isPromotionMove) {
      this.promotionRequest = {
        startFile: originFile,
        startRank: originRank,
        endFile: targetFile,
        endRank: targetRank,
        draggedPieceX: x,
        draggedPieceY: y,
      };
      return;
    }

    if (!moveTryResult) {
      this.cancelDragAndDrop();
      return;
    }

    this.logicalBoard.move({ from: originSquare, to: targetSquare });

    this.cancelDragAndDrop();
  }

  @Listen('mouseleave', { passive: false })
  handleMouseLeave(evt: MouseEvent) {
    evt.preventDefault();
    if (this.promotionRequest.startFile) return;
    this.cancelDragAndDrop();
  }

  isDndCrossCell(col: number, row: number): boolean {
    if (!this.dndPieceData.piece) return false;
    const file = this.reversed ? 7 - col : col;
    const rank = this.reversed ? row : 7 - row;

    return file === this.dndPieceData.endFile || rank === this.dndPieceData.endRank;
  }

  isDndOriginCell(col: number, row: number): boolean {
    if (!this.dndPieceData.piece) return false;
    const file = this.reversed ? 7 - col : col;
    const rank = this.reversed ? row : 7 - row;

    return file === this.dndPieceData.startFile && rank === this.dndPieceData.startRank;
  }

  isDndTargetCell(col: number, row: number): boolean {
    if (!this.dndPieceData.piece) return false;
    const file = this.reversed ? 7 - col : col;
    const rank = this.reversed ? row : 7 - row;

    return file === this.dndPieceData.endFile && rank === this.dndPieceData.endRank;
  }

  commitPromotion(pieceType: string) {
    if (!this.promotionRequest.startFile) return;
    if (!['n', 'b', 'r', 'q'].includes(pieceType)) return;

    const originSquare = this.getSquareFromCoordinates(this.promotionRequest.startFile, this.promotionRequest.startRank);
    const targetSquare = this.getSquareFromCoordinates(this.promotionRequest.endFile, this.promotionRequest.endRank);

    this.logicalBoard.move({from: originSquare, to: targetSquare, promotion: pieceType as ShortMove['promotion']});

    this.promotionRequest = {
      startFile: undefined,
      startRank: undefined,
      endFile: undefined,
      endRank: undefined,
    }

    this.cancelDragAndDrop();
  }

  render() {
    const isWhiteTurn = this.logicalBoard.turn() === 'w';
    const turnClasses = isWhiteTurn ? 'turn--white' : 'turn--black';

    const whitePawnDragged = this.dndPieceData.piece?.type === 'p' && this.dndPieceData.piece?.color === 'w';
    const whiteKnightDragged = this.dndPieceData.piece?.type === 'n' && this.dndPieceData.piece?.color === 'w';
    const whiteBishopDragged = this.dndPieceData.piece?.type === 'b' && this.dndPieceData.piece?.color === 'w';
    const whiteRookDragged = this.dndPieceData.piece?.type === 'r' && this.dndPieceData.piece?.color === 'w';
    const whiteQueenDragged = this.dndPieceData.piece?.type === 'q' && this.dndPieceData.piece?.color === 'w';
    const whiteKingDragged = this.dndPieceData.piece?.type === 'k' && this.dndPieceData.piece?.color === 'w';

    const blackPawnDragged = this.dndPieceData.piece?.type === 'p' && this.dndPieceData.piece?.color === 'b';
    const blackKnightDragged = this.dndPieceData.piece?.type === 'n' && this.dndPieceData.piece?.color === 'b';
    const blackBishopDragged = this.dndPieceData.piece?.type === 'b' && this.dndPieceData.piece?.color === 'b';
    const blackRookDragged = this.dndPieceData.piece?.type === 'r' && this.dndPieceData.piece?.color === 'b';
    const blackQueenDragged = this.dndPieceData.piece?.type === 'q' && this.dndPieceData.piece?.color === 'b';
    const blackKingDragged = this.dndPieceData.piece?.type === 'k' && this.dndPieceData.piece?.color === 'b';

    let draggedImage: string;
    if (whitePawnDragged) draggedImage = getAssetPath('./assets/chess_vectors/Chess_plt45.svg');
    if (whiteKnightDragged) draggedImage = getAssetPath('./assets/chess_vectors/Chess_nlt45.svg');
    if (whiteBishopDragged) draggedImage = getAssetPath('./assets/chess_vectors/Chess_blt45.svg');
    if (whiteRookDragged) draggedImage = getAssetPath('./assets/chess_vectors/Chess_rlt45.svg');
    if (whiteQueenDragged) draggedImage = getAssetPath('./assets/chess_vectors/Chess_qlt45.svg');
    if (whiteKingDragged) draggedImage = getAssetPath('./assets/chess_vectors/Chess_klt45.svg');
    if (blackPawnDragged) draggedImage = getAssetPath('./assets/chess_vectors/Chess_pdt45.svg');
    if (blackKnightDragged) draggedImage = getAssetPath('./assets/chess_vectors/Chess_ndt45.svg');
    if (blackBishopDragged) draggedImage = getAssetPath('./assets/chess_vectors/Chess_bdt45.svg');
    if (blackRookDragged) draggedImage = getAssetPath('./assets/chess_vectors/Chess_rdt45.svg');
    if (blackQueenDragged) draggedImage = getAssetPath('./assets/chess_vectors/Chess_qdt45.svg');
    if (blackKingDragged) draggedImage = getAssetPath('./assets/chess_vectors/Chess_kdt45.svg');

    const draggedPieceStyle = draggedImage
      ? {
          left: this.dndPieceData.x.toString() + 'px',
          top: this.dndPieceData.y.toString() + 'px',
        }
      : {};

    const promotionKnight = this.logicalBoard.turn() === 'w' ? getAssetPath('./assets/chess_vectors/Chess_nlt45.svg') : getAssetPath('./assets/chess_vectors/Chess_ndt45.svg');
    const promotionBishop = this.logicalBoard.turn() === 'w' ? getAssetPath('./assets/chess_vectors/Chess_blt45.svg') : getAssetPath('./assets/chess_vectors/Chess_bdt45.svg');
    const promotionRook = this.logicalBoard.turn() === 'w' ? getAssetPath('./assets/chess_vectors/Chess_rlt45.svg') : getAssetPath('./assets/chess_vectors/Chess_rdt45.svg');
    const promotionQueen = this.logicalBoard.turn() === 'w' ? getAssetPath('./assets/chess_vectors/Chess_qlt45.svg') : getAssetPath('./assets/chess_vectors/Chess_qdt45.svg');

    return (
      <Fragment>
        <div id="lower_layer">
          <div></div>
          {[0, 1, 2, 3, 4, 5, 6, 7].map(colIndex => {
            const key = 'top_coord_' + colIndex;
            const letter = String.fromCharCode('A'.charCodeAt(0) + (this.reversed ? 7 - colIndex : colIndex));
            return (
              <p class="coordinate" key={key}>
                {letter}
              </p>
            );
          })}
          <div></div>

          {[0, 1, 2, 3, 4, 5, 6, 7].map(rowIndex => {
            const digit = String.fromCharCode('1'.charCodeAt(0) + (this.reversed ? rowIndex : 7 - rowIndex));
            return (
              <Fragment>
                <p class="coordinate" key={'left_coord_' + rowIndex}>
                  {digit}
                </p>
                {[
                  ...[0, 1, 2, 3, 4, 5, 6, 7].map(colIndex => {
                    const isWhiteCell = (colIndex + rowIndex) % 2 == 0;
                    let classes = isWhiteCell ? 'cell cell--white' : 'cell cell--black';
                    if (this.isDndCrossCell(colIndex, rowIndex)) classes = 'cell cell--dndcross';
                    if (this.isDndOriginCell(colIndex, rowIndex)) classes = 'cell cell--dndorigin';
                    if (this.isDndTargetCell(colIndex, rowIndex)) classes = 'cell cell--dndtarget';
                    const pieceImage = this.getImageAtCell(colIndex, rowIndex);
                    return (
                      <div class={classes} key={'cell_' + rowIndex + colIndex}>
                        {pieceImage && <img class="cell_piece" src={pieceImage}></img>}
                      </div>
                    );
                  }),
                ]}
                <p class="coordinate" key={'right_coord_' + rowIndex}>
                  {digit}
                </p>
              </Fragment>
            );
          })}

          <div></div>
          {[0, 1, 2, 3, 4, 5, 6, 7].map(colIndex => {
            const key = 'bottom_coord_' + colIndex;
            const letter = String.fromCharCode('A'.charCodeAt(0) + (this.reversed ? 7 - colIndex : colIndex));
            return (
              <p class="coordinate" key={key}>
                {letter}
              </p>
            );
          })}
          <div class="turn">
            <div class={turnClasses}></div>
          </div>
        </div>

        <div id="dnd_layer" ref={el => (this.dragLayerElement = el as HTMLDivElement)}>
          {draggedImage && <img src={draggedImage} class="dragged_piece" style={draggedPieceStyle}></img>}
        </div>

        {this.promotionRequest.startFile && (
          <div id="promotion_dialog_backdrop">
            <div id="promotion_dialog_content">
              <img class="promotion_button" onClick={() => this.commitPromotion('n')} src={promotionKnight}></img>
              <img class="promotion_button" onClick={() => this.commitPromotion('b')} src={promotionBishop}></img>
              <img class="promotion_button" onClick={() => this.commitPromotion('r')} src={promotionRook}></img>
              <img class="promotion_button" onClick={() => this.commitPromotion('q')} src={promotionQueen}></img>
            </div>
          </div>
        )}
      </Fragment>
    );
  }
}

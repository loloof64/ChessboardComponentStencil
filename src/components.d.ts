/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { MoveAsParameter, MoveDone } from "./components/loloof64-chessboard-stencil/loloof64-chessboard-stencil";
import { Move, ShortMove } from "chess.js";
export namespace Components {
    interface Loloof64ChessboardStencil {
        /**
          * True if black can play move on the board, or false if black must set moves manually (by calling playMove() or playMoveSAN() method).
         */
        "blackPlayerHuman": boolean;
        /**
          * Says if game is running or not. Returns (boolean) true if and only if the game is in progress.
         */
        "gameInProgress": () => Promise<boolean>;
        /**
          * Returns the current position. Returns (string) the position in Forsyth-Edwards Notation.
         */
        "getCurrentPosition": () => Promise<string>;
        /**
          * True if and only if last move arrow must be visible (if available).
         */
        "lastMoveVisible": boolean;
        /**
          * Tries to play the given move on the board, only if the current player is defined as an external user. Returns (boolean) true if and only if the move has been commited.
         */
        "playMove": (move: MoveAsParameter) => Promise<boolean>;
        /**
          * Tries to play the given move SAN on the board, only if the current player is defined as an external user. Returns (boolean) true if and only if the move has been commited.
         */
        "playMoveSAN": (moveSan: string) => Promise<boolean>;
        /**
          * True if and only if the black side is at bottom.
         */
        "reversed": boolean;
        /**
          * Starts a new game. * startPositionFen: the requested position. If passed an empty string, will load default position. If passed illegal position, will throw an exception (with an english message as a string).
         */
        "startNewGame": (startPositionFen: string) => Promise<void>;
        /**
          * True if white can play move on the board, or false if white must set moves manually (by calling playMove() or playMoveSAN() method).
         */
        "whitePlayerHuman": boolean;
    }
}
declare global {
    interface HTMLLoloof64ChessboardStencilElement extends Components.Loloof64ChessboardStencil, HTMLStencilElement {
    }
    var HTMLLoloof64ChessboardStencilElement: {
        prototype: HTMLLoloof64ChessboardStencilElement;
        new (): HTMLLoloof64ChessboardStencilElement;
    };
    interface HTMLElementTagNameMap {
        "loloof64-chessboard-stencil": HTMLLoloof64ChessboardStencilElement;
    }
}
declare namespace LocalJSX {
    interface Loloof64ChessboardStencil {
        /**
          * True if black can play move on the board, or false if black must set moves manually (by calling playMove() or playMoveSAN() method).
         */
        "blackPlayerHuman"?: boolean;
        /**
          * True if and only if last move arrow must be visible (if available).
         */
        "lastMoveVisible"?: boolean;
        /**
          * Game ended by checkmate. The payload detail (eventValue.detail) is true if and only if white has been checkmated.
         */
        "onCheckmate"?: (event: CustomEvent<boolean>) => void;
        /**
          * Game ended by 50 moves rule.
         */
        "onFiftyMovesRule"?: (event: CustomEvent<void>) => void;
        /**
          * Game ended by insufficient material.
         */
        "onInsufficientMaterial"?: (event: CustomEvent<void>) => void;
        /**
          * Move done on the board: either by human, or done manually. The payload detail has the following values : moveNumber (number), whiteTurn (boolean), moveFan (string), moveSan (string), fromFileIndex (number), fromRankIndex (number), toFileIndex (number), toRankIndex (number).
         */
        "onMoveDone"?: (event: CustomEvent<MoveDone>) => void;
        /**
          * Game ended by stalemate.
         */
        "onStalemate"?: (event: CustomEvent<void>) => void;
        /**
          * Game ended by threeFoldRepetition.
         */
        "onThreeFoldRepetition"?: (event: CustomEvent<void>) => void;
        /**
          * True if and only if the black side is at bottom.
         */
        "reversed"?: boolean;
        /**
          * True if white can play move on the board, or false if white must set moves manually (by calling playMove() or playMoveSAN() method).
         */
        "whitePlayerHuman"?: boolean;
    }
    interface IntrinsicElements {
        "loloof64-chessboard-stencil": Loloof64ChessboardStencil;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "loloof64-chessboard-stencil": LocalJSX.Loloof64ChessboardStencil & JSXBase.HTMLAttributes<HTMLLoloof64ChessboardStencilElement>;
        }
    }
}

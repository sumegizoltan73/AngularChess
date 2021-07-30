import { ChessBase } from './chess-base.';
import { FigurePawn } from './chess-figure-pawn';
import { FigureRook } from './chess-figure-rook';
import { FigureKnight } from './chess-figure-knight';
import { FigureBishop } from './chess-figure-bishop';
import { FigureQueen } from './chess-figure-queen';
import { FigureKing } from './chess-figure-king';

export class ChessFactory {
    static createFigure(type: string, color: string, x: number, y: number): void {
        let fig: IFigure | null = null;
        const chessBase = ChessBase.instance;

        switch (type) {
            case 'rook':
                fig = new FigureRook(color);
                break;

            case 'knight':
                fig = new FigureKnight(color);
                break;

            case 'bishop':
                fig = new FigureBishop(color);
                break;

            case 'queen':
                fig = new FigureQueen(color);
                break;

            case 'king':
                fig = new FigureKing(color);
                break;
        
            default:
                fig = new FigurePawn(color);
                break;
        }

        chessBase.board.push({
            x: x,
            y: y,
            figure: fig
        });
    }
}

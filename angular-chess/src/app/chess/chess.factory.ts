import { ChessBase } from './chess-base.';
import { FigurePeasant } from './chess-figure-peasant';
import { FigureBastion } from './chess-figure-bastion';
import { FigureColt } from './chess-figure-colt';
import { FigureRunner } from './chess-figure-runner';
import { FigureQueen } from './chess-figure-queen';
import { FigureKing } from './chess-figure-king';

export class ChessFactory {
    static createFigure(type: string, color: string, x: number, y: number): void {
        let fig: IFigure | null = null;
        const chessBase = ChessBase.instance;

        switch (type) {
            case 'bastion':
                fig = new FigureBastion(color);
                break;

            case 'colt':
                fig = new FigureColt(color);
                break;

            case 'runner':
                fig = new FigureRunner(color);
                break;

            case 'queen':
                fig = new FigureQueen(color);
                break;

            case 'king':
                fig = new FigureKing(color);
                break;
        
            default:
                fig = new FigurePeasant(color);
                break;
        }

        chessBase.board.push({
            x: x,
            y: y,
            figure: fig
        });
    }
}

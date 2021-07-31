import { ChessBase } from "./chess-base.";

export class Figure {

    protected chessBase: ChessBase;

    constructor(public name: string, public color: string){
        this.chessBase = ChessBase.instance;
    }

    protected isStepNotBlocked(step: IStep): boolean {
        let _retVal = true;

        if (!this.isCellToNotBlockedBySameFigure(step)) {
            _retVal = false;
        }

        return _retVal;
    }

    protected isCellToNotBlockedBySameFigure(step: IStep): boolean {
        let _retVal = true;
        const figTo = this.chessBase.getFigure(step.to!.x, step.to!.y);

        if (figTo && figTo.color === this.color){ 
            _retVal = false;
        }

        return _retVal;
    }

    protected isCoordsNotEquals(step: IStep): boolean {
        let _retVal = true;

        if (step.from!.x === step.to!.x && step.from!.y === step.to!.y) {
            _retVal = false;
        }

        return _retVal;
    }

    protected isOneCellStep(step: IStep): boolean {
        // king, pawn
        return true;
    }

    protected isLinearStep(step: IStep): boolean {
        // rook, queen

        // from.y === to.y || from.x === to.x
        return true;
    }

    protected isDiagonalStep(step: IStep): boolean {
        // bishop, queen

        // (to.y - from.y) === (to.x - from.x)
        return true;
    }

}
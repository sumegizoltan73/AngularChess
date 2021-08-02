import { Figure } from "./chess-figure";

export class FigureKing extends Figure implements IFigure {

    isMoved: boolean = false;
    
    constructor(color: string){
        super('king', color);
    }

    isStepPossible(step: IStep): boolean {
        let _retVal = false;
        const isCastling = this.isCastling(step);

        if (this.isCoordsNotEquals(step)
                && (this.isStepNotBlocked(step) || isCastling)
                && (this.isOneCellStep(step) || isCastling)) {
            _retVal = true;
        }

        return _retVal;
    }

    private isCastling(step: IStep): boolean {
        // orig_pos && castling
        let _retVal = false;

        if (this.isOrigPosition(step)) {
            const stepOffset = Math.abs(step.to!.x - step.from!.x);
            const rookOffset = (step.to!.x > step.from!.x) ? 1 : -1;
            const rookX = step.from!.x + rookOffset;
            const fig = this.chessBase.getFigure(rookX, step.from!.y);
            
            if ((stepOffset === 2) && fig && fig.name === 'rook' && fig.color === this.color) {
                _retVal = true;
            }
        } 

        return _retVal;
    }

    isOrigPosition(step: IStep): boolean {
        return !this.isMoved && ((this.color === 'white' && step.from!.y === 7 && step.from!.x === 4) 
                || (this.color === 'black' && step.from!.y === 0 && step.from!.x === 4));
    }

}
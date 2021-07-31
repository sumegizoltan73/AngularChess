import { Figure } from "./chess-figure";

export class FigureKing extends Figure implements IFigure {
    
    constructor(color: string){
        super('king', color);
    }

    isStepPossible(step: IStep): boolean {
        let _retVal = false;
        
        if (this.isCoordsNotEquals(step)
                && this.isStepNotBlocked(step)
                && (this.isOneCellStep(step) || this.isCastling(step))) {
            _retVal = true;
        }

        return _retVal;
    }

    private isCastling(step: IStep): boolean {
        // orig_pos && castling
        return false;
    }

}
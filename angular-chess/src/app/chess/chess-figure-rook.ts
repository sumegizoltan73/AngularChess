import { Figure } from "./chess-figure";

export class FigureRook extends Figure implements IFigure {
    
    constructor(color: string){
        super('rook', color, 8, 8);
    }

    isStepPossible(step: IStep): boolean {
        let _retVal = false;
        
        if (this.isCoordsNotEquals(step)) {
            if (this.isLinearStep(step)) {
                if (this.isStepNotBlocked(step)) {
                    _retVal = true;
                }
            }
        }

        return _retVal;
    }

}
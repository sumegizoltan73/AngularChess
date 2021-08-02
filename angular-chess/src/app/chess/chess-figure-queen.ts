import { Figure } from "./chess-figure";

export class FigureQueen extends Figure implements IFigure {
    
    constructor(color: string){
        super('queen', color);
    }

    isStepPossible(step: IStep): boolean {
        let _retVal = false;
        
        if (this.isCoordsNotEquals(step) 
                && this.isStepNotBlocked(step)
                && (this.isLinearStep(step) || this.isDiagonalStep(step))) {
            _retVal = true;
        }

        return _retVal;
    }

}
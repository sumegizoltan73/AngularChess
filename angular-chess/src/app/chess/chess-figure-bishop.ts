import { Figure } from "./chess-figure";

export class FigureBishop extends Figure implements IFigure {
    
    constructor(color: string){
        super('bishop', color);
    }

    isStepPossible(step: IStep): boolean {
        let _retVal = false;
        
        if (this.isCoordsNotEquals(step) 
                && this.isStepNotBlocked(step)
                && this.isDiagonalStep(step)) {
            _retVal = true;
        }

        return _retVal;
    }

}
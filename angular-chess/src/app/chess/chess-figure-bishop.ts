import { Figure } from "./chess-figure";

export class FigureBishop extends Figure implements IFigure {
    
    constructor(color: string){
        super('bishop', color, 8, 8);
    }

    isStepPossible(step: IStep): boolean {
        let _retVal = false;
        
        if (this.isCoordsNotEquals(step)) {
            if (this.isDiagonalStep(step)) {
                if (this.isStepNotBlocked(step)) {
                    _retVal = true;
                }
            }
        }

        return _retVal;
    }

}
import { basename } from "path";
import { Figure } from "./chess-figure";

export class FigureRook extends Figure implements IFigure {
    
    constructor(color: string){
        super('rook', color);
    }

    isStepPossible(step: IStep): boolean {
        let _retVal = false;
        
        if (this.isCoordsNotEquals(step) 
                && this.isStepNotBlocked(step)
                && this.isLinearStep(step)) {
            _retVal = true;
        }

        return _retVal;
    }

}
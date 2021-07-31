import { Figure } from "./chess-figure";

export class FigureQueen extends Figure implements IFigure {
    
    constructor(color: string){
        super('queen', color);
    }

    isStepPossible(step: IStep): boolean {
        let _retVal = false;
        // if (from !== to && (from.y === to.y || from.x === to.x || ... (to.y - from.y) === (to.x - from.x) ))
        if (this.isCoordsNotEquals(step) && this.isStepNotBlocked(step)) {
            _retVal = true;
        }

        return _retVal;
    }

}
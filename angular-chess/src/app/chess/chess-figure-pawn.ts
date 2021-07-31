import { Figure } from "./chess-figure";

export class FigurePawn extends Figure implements IFigure {
    
    constructor(color: string){
        super('pawn', color);
    }

    isStepPossible(step: IStep): boolean {
        let _retVal = false;
        
        if (this.isCoordsNotEquals(step) 
                && this.isStepNotBlocked(step)
                && this.isForwardStep(step) 
                && (this.isOneCellStep(step) || this.isTwoCellStepFromOrig(step)) ) {
            _retVal = true;
        }

        return _retVal;
    }

    private isForwardStep(step: IStep): boolean {
        
        return true;
    }

    protected isTwoCellStepFromOrig(step: IStep): boolean {
        
        return true;
    }

}
import { Figure } from "./chess-figure";

export class FigureKnight extends Figure implements IFigure {
    
    constructor(color: string){
        super('knight', color);
    }

    isStepPossible(step: IStep): boolean {
        let _retVal = false;
        
        if (this.isCoordsNotEquals(step) ) {
            _retVal = true;
        }

        return _retVal;
    }

}
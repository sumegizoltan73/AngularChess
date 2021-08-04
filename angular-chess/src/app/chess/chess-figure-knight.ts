import { Figure } from "./chess-figure";

export class FigureKnight extends Figure implements IFigure {
    
    constructor(color: string){
        super('knight', color, 2, 2);
    }

    isStepPossible(step: IStep): boolean {
        let _retVal = false;
        
        if (this.isCoordsNotEquals(step)) {
            if (this.isKnightStep(step)) {
                if (this.isCellToNotBlockedBySameFigure(step)) {
                    if (this.isCellToNotBlockedByEnemyKing(step)) { 
                        _retVal = true;
                    }
                }
            }
        }

        return _retVal;
    }

    private isKnightStep(step: IStep): boolean {
        let _retVal = false;

        if ((Math.abs(step.to!.x - step.from!.x) === 2 && Math.abs(step.to!.y - step.from!.y) === 1 )
                || (Math.abs(step.to!.x - step.from!.x) === 1 && Math.abs(step.to!.y - step.from!.y) === 2 )) {
            _retVal = true;
        }

        return _retVal;
    }

}
import { Figure } from "./chess-figure";

export class FigureRook extends Figure implements IFigure {
    isMoved: boolean = false;

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

    isOrigPosition(step: IStep): boolean {
        return !this.isMoved && (
                (this.color === 'white' && step.from!.y === 7 && step.from!.x === 7)
                || (this.color === 'white' && step.from!.y === 7 && step.from!.x === 0) 
                || (this.color === 'black' && step.from!.y === 0 && step.from!.x === 0) 
                || (this.color === 'black' && step.from!.y === 0 && step.from!.x === 7)
        );
    }

}
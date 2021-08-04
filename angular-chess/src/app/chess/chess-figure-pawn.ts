import { Figure } from "./chess-figure";

export class FigurePawn extends Figure implements IFigure {
    
    constructor(color: string){
        super('pawn', color, 1, 2);
    }

    isStepPossible(step: IStep): boolean {
        let _retVal = false;
        
        if (this.isCoordsNotEquals(step)) {
            if (this.isDistancePossible(step)) {
                if (this.isForwardStep(step)) {
                    if (this.isStepNotBlocked(step)) { 
                        if (this.isOneCellStep(step) || this.isTwoCellStepFromOrig(step)) {
                            if ((this.isLinearStep(step) && this.isStepNotBlockedByEnemy(step)) 
                                || (this.isDiagonalStep(step) && this.isPunchOrEnPassant(step))) { 
                                _retVal = true;
                            }
                        }
                    }
                }
            }
        }

        return _retVal;
    }

    private isForwardStep(step: IStep): boolean {
        let _retVal = false;
        
        if ((this.color === 'white' && step.from!.y > step.to!.y)
                || (this.color === 'black' && step.from!.y < step.to!.y)) {
            _retVal = true;
        }

        return _retVal;
    }

    private isTwoCellStepFromOrig(step: IStep): boolean {
        
        return (this.isLinearStep(step) && this.isOrigPosition(step) && this.isTwoCellStep(step));
    }

    private isPunchOrEnPassant(step: IStep): boolean {

        return (this.isPunch(step) || this.isEnPassant(step));
    }

    private isPunch(step: IStep): boolean {
        let _retVal = false;
        const fig = this.chessBase.getFigure(step.to!.x, step.to!.y);

        if (fig && fig.color !== this.color) {
            if (fig.name !== 'king' || this.chessBase.isHitEnemyKingCanBeTested) {
                _retVal = true;
            }
        }

        return _retVal;
    }

    private isEnPassant(step: IStep): boolean {
        let _retVal = false;
        const fig = this.chessBase.getFigure(step.to!.x, step.to!.y);

        if (!fig && this.chessBase.enPassant) {
            if (this.chessBase.enPassant.to.x === step.to!.x && this.chessBase.enPassant.to.y === step.to!.y) {
                _retVal = true;
            }
        }

        return _retVal;
    }

    isMovedToEnPassantPosition(step: IStep): boolean {
        let _retVal = false;

        if (this.isTwoCellStepFromOrig(step)) {
            const offsetY = (step.to!.y > step.from!.y) ? 1 : -1;
            const fig = this.chessBase.getFigure(step.to!.x, step.to!.y + offsetY);

            if (fig && fig.color !== this.color) {
                const figInLeft = (step.to!.x > 0) ? this.chessBase.getFigure(step.to!.x - 1, step.to!.y) : null;
                const figInRight = (step.to!.x < 7) ? this.chessBase.getFigure(step.to!.x + 1, step.to!.y) : null;

                if ((figInLeft && figInLeft.color !== this.color)
                        || (figInRight && figInRight.color !== this.color)) {
                    _retVal = true;
                }
            }
        }

        return _retVal;
    }

    private isTwoCellStep(step: IStep): boolean {
        return ((this.color === 'white' && (step.from!.y - step.to!.y) === 2)
                || (this.color === 'black' && (step.to!.y - step.from!.y) === 2));
    }

    private isOrigPosition(step: IStep): boolean {
        return (this.color === 'white' && step.from!.y === 6) 
                || (this.color === 'black' && step.from!.y === 1);
    }

    private isStepNotBlockedByEnemy(step: IStep): boolean {
        let _retVal = true;
        const fig = this.chessBase.getFigure(step.to!.x, step.to!.y);

        if (fig && fig.color !== this.color) {
            _retVal = false;
        }
        
        return _retVal;
    }
}
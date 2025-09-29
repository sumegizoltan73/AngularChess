import { ChessBase } from "./chess-base.";
import { Figure } from "./chess-figure";

export class FigureKing extends Figure implements IFigure {

    isMoved: boolean = false;
    
    constructor(color: string){
        super('king', color, 2, 1);
    }

    isStepPossible(step: IStep): boolean {
        let _retVal = false;

        if (this.isCoordsNotEquals(step)) {
            if (this.isDistancePossible(step)) {
                const isCastling = this.isCastling(step);
                
                if (this.isOneCellStep(step) || isCastling) {
                    if (this.isStepNotBlocked(step) || isCastling) {
                        if (this.isStepNotBlockedByEnemyKnightRange(step)) {
                            _retVal = true;
                        }
                    }
                }
            }
            else {
                console.log("Distance not possible");
            }
        }

        return _retVal;
    }

    isOrigPosition(step: IStep): boolean {
        return !this.isMoved && ((this.color === 'white' && step.from!.y === 7 && step.from!.x === 4) 
                || (this.color === 'black' && step.from!.y === 0 && step.from!.x === 4));
    }

    getRange(x: number, y: number): ICord[] {
        let _retVal: ICord[] = [];

        // current row
        if (x > 0) {
            _retVal.push({ x: x - 1, y: y });
        }
        if (x < 7) {
            _retVal.push({ x: x + 1, y: y });
        }

        // under
        if (this.color === 'white' && y < 7 || this.color === 'black' && y > 0) {
            const u = (this.color === 'white') ? y + 1 : y - 1;
            if (x > 0) {
                _retVal.push({ x: x - 1, y: u });
            }
            _retVal.push({ x: x, y: u });
            if (x < 7) {
                _retVal.push({ x: x + 1, y: u });
            }
        }

        // above
        if (this.color === 'white' && y > 0 || this.color === 'black' && y < 7) {
            const a = (this.color === 'white') ? y - 1 : y + 1;
            if (x > 0) {
                _retVal.push({ x: x - 1, y: a });
            }
            _retVal.push({ x: x, y: a });
            if (x < 7) {
                _retVal.push({ x: x + 1, y: a });
            }
        }

        return _retVal;
    }

    private isCastling(step: IStep): boolean {
        // orig_pos && castling
        let _retVal = false;

        if (this.isOrigPosition(step)) {
            const stepOffset = Math.abs(step.to!.x - step.from!.x);
            const rookOffset = (step.to!.x > step.from!.x) ? 3 : -4;
            const rookX = step.from!.x + rookOffset;
            const fig = ChessBase.instance.getFigure(rookX, step.from!.y);
            let isAllCellEmpty = true;
            if (rookOffset < 0) {
                const figEmpty = ChessBase.instance.getFigure(rookX + 1, step.from!.y);
                isAllCellEmpty = !figEmpty;
            }

            if (isAllCellEmpty && (stepOffset === 2) && fig && fig.name === 'rook' && fig.color === this.color) {
                _retVal = true;
            }
        } 

        return _retVal;
    }

    private isStepNotBlockedByEnemyKnightRange(step: IStep): boolean {
        let _retVal = true;
        const enemyColor = (this.color === 'white') ? 'black' : 'white';
        const cell = ChessBase.instance.getKingWithCell(enemyColor);

        if (Math.abs(cell.x - step.to!.x) <= 1 && Math.abs(cell.y - step.to!.y) <= 1) {
            _retVal = false;
        }
        
        return _retVal;
    }

}
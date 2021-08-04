import { ChessBase } from "./chess-base.";

export class Figure {

    protected chessBase: ChessBase;
    protected maxX: number;
    protected maxY: number;

    constructor(public name: string, public color: string, maxX: number, maxY: number){
        this.chessBase = ChessBase.instance;
        this.maxX = maxX;
        this.maxY = maxY;
    }

    protected isDistancePossible(step: IStep): boolean {
        let _retVal = false;

        if (Math.abs(step.to!.x - step.from!.x) <= this.maxX && Math.abs(step.to!.y - step.from!.y) <= this.maxY) {
            _retVal = true;
        }

        return _retVal;
    }

    protected isStepNotBlocked(step: IStep): boolean {
        let _retVal = true;

        if (!this.isCellToNotBlockedBySameFigure(step) || (!this.isCellToNotBlockedByEnemyKing(step))) {
            _retVal = false;
        }
        else {
            const increaseX = this.getIncreaseX(step);
            const increaseY = this.getIncreaseY(step);
            let x: number = step.from!.x;
            let y: number = step.from!.y;
            let fig: IFigure | null = null;
            let processNext: boolean = true;

            while(_retVal && processNext) {
                x += increaseX;
                y += increaseY;
                if (step.to!.x === x && step.to!.y === y) {
                    processNext = false;
                }
                else {
                    fig = this.chessBase.getFigure(x, y);
                    if (fig) {
                        processNext = false;
                        _retVal = false;
                    }
                } 
            }
        }

        return _retVal;
    }

    protected getIncreaseX(step: IStep): number {
        return (step.to!.x > step.from!.x) ? 1 : (step.to!.x === step.from!.x) ? 0 : -1;
    }

    protected getIncreaseY(step: IStep): number {
        return (step.to!.y > step.from!.y) ? 1 : (step.to!.y === step.from!.y) ? 0 : -1;
    }

    protected isCellToNotBlockedBySameFigure(step: IStep): boolean {
        let _retVal = true;
        const figTo = this.chessBase.getFigure(step.to!.x, step.to!.y);

        if (figTo && figTo.color === this.color){ 
            _retVal = false;
        }

        return _retVal;
    }

    protected isCellToNotBlockedByEnemyKing(step: IStep): boolean {
        let _retVal = true;

        if (!(this.chessBase.isHitEnemyKingCanBeTested || this.name === 'pawn')) {
            const figTo = this.chessBase.getFigure(step.to!.x, step.to!.y);

            if (figTo && (figTo.color !== this.color) && (figTo.name === 'king')){ 
                _retVal = false;
            }
        }

        return _retVal;
    }

    protected isCoordsNotEquals(step: IStep): boolean {
        let _retVal = true;

        if (step.from!.x === step.to!.x && step.from!.y === step.to!.y) {
            _retVal = false;
        }

        return _retVal;
    }

    protected isOneCellStep(step: IStep): boolean {
        // king, pawn
        
        return ((Math.abs(step.to!.y - step.from!.y) < 2) && (Math.abs(step.to!.x - step.from!.x) < 2));
    }

    protected isLinearStep(step: IStep): boolean {
        // rook, queen

        return (step.from!.y === step.to!.y || step.from!.x === step.to!.x);
    }

    protected isDiagonalStep(step: IStep): boolean {
        // bishop, queen

        return (Math.abs(step.to!.y - step.from!.y) === Math.abs(step.to!.x - step.from!.x));
    }

}
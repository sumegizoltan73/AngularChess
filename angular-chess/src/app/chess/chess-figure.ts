export class Figure {

    constructor(public name: string, public color: string){

    }

    protected isStepNotBlocked(step: IStep): boolean {
        
        return true;
    }

    protected isCoordsNotEquals(step: IStep): boolean {
        
        return true;
    }

    protected isOneCellStep(step: IStep): boolean {
        // king, pawn
        return true;
    }

    protected isLinearStep(step: IStep): boolean {
        // rook, queen

        // from.y === to.y || from.x === to.x
        return true;
    }

    protected isDiagonalStep(step: IStep): boolean {
        // bishop, queen

        // (to.y - from.y) === (to.x - from.x)
        return true;
    }

}
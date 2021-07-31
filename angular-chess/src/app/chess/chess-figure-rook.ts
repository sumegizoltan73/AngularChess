
export class FigureRook implements IFigure {
    name: string = 'rook';
    
    constructor(public color: string){

    }

    isStepPossible(step: IStep): boolean {
        // if (from !== to && (from.y === to.y || from.x === to.x))
        
        return true;
    }

}
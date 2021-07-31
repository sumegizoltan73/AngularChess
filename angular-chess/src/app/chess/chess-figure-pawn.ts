
export class FigurePawn implements IFigure {
    name: string = 'pawn';
    
    constructor(public color: string){

    }

    isStepPossible(step: IStep): boolean {
        // if (from !== to && (...))
        
        return true;
    }

}
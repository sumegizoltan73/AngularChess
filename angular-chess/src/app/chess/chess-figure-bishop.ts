
export class FigureBishop implements IFigure {
    name: string = 'bishop';
    
    constructor(public color: string){

    }

    isStepPossible(step: IStep): boolean {
        // if (from !== to && (...))
        
        return true;
    }

}
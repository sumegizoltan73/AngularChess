
interface IFigure {
    name: string;
    color: string;
    isStepPossible(step: IStep): boolean;
}
  
interface ICell {
    x: number;
    y: number;
    figure: IFigure | null;
}
  
interface ICord {
    x: number;
    y: number;
}
  
interface IStep {
    from: ICord | null;
    to: ICord | null;
}


interface IStepDetail {
    step: IStep;
    additionalStep: IStep | null;
    fig: string;
    isStrike: boolean;
    isCheck: boolean;
    isCheckMate: boolean;
    get figure(): string;
    get castling(): string;
    get notation(): string;
}
  
interface IStepNotation {
    white: IStepDetail;
    black: IStepDetail | null;
}

interface IChatMessage {
    player: string;
    name: string;
    message: string;
    isOwnMessage: boolean;
}
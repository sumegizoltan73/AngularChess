
interface IFigure {
    name: string;
    icon: string;
    color: string;
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
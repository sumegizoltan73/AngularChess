import { Component, OnInit } from '@angular/core';

export interface IFigure {
  name: string;
  color: string;
}

@Component({
  selector: 'app-chess',
  templateUrl: './chess.component.html',
  styleUrls: ['./chess.component.less']
})
export class ChessComponent implements OnInit {

  x: string[] = ['a','b','c','d','e','f','g','h'];
  y: string[] = ['8','7','6','5','4','3','2','1'];

  constructor() { }

  ngOnInit(): void {
  }

  isCellWhite(x: number, y: number): boolean {
    return (x % 2 === 0 && y % 2 === 0) || (x % 2 !== 0 && y % 2 !== 0);
  }

  figure(x: number, y: number): string {
    const fig = this.getFigure(x, y);
    
    return (fig) ? fig.name : "";
  }

  colorOfFigure(x: number, y: number): string {
    const fig = this.getFigure(x, y);
    
    return (fig) ? fig.color : "";
  }

  private getFigure(x: number, y: number): IFigure | null {
    // test
    if ((8 - y) === 7)
      return { name: 'person', color: 'black'};

    return null;
  }
}

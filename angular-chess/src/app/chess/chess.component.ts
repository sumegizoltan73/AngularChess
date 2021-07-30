import { Component, OnInit } from '@angular/core';
import { ChessBase } from './chess-base.'

@Component({
  selector: 'app-chess',
  templateUrl: './chess.component.html',
  styleUrls: ['./chess.component.less']
})
export class ChessComponent implements OnInit {

  x: string[] = ['a','b','c','d','e','f','g','h'];
  y: string[] = ['8','7','6','5','4','3','2','1'];
  msg: string = '';

  private chessBase: ChessBase;
  private isWhiteNext: boolean = true;
  private isGoFrom: boolean = true;
  private step: IStep = { from: null, to: null };

  constructor() { 
    this.chessBase = ChessBase.instance;
    this.fillBoard();
  }

  get colorOfNext(): string {
    return (this.isWhiteNext) ? 'white' : 'black';
  }

  ngOnInit(): void {
  }

  onCellClick(x: number, y: number): void {
    if (this.isGoFrom) {
      this.setFrom(x, y);
    }
    else {
      this.setTo(x, y);
    }
  }

  isCellWhite(x: number, y: number): boolean {
    // board colorize
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
    return this.chessBase.getFigure(x, y);
  }

  private setFrom(x: number, y: number): void {
    const fig = this.getFigure(x, y);

    if (fig && fig.color === this.colorOfNext) {
      this.isGoFrom = !this.isGoFrom;
      this.step.from = { x: x, y: y};
      this.msg = this.colorOfNext + ': Click the next cell!';
    }
    else {
      this.msg = 'This step is illegal! ' + this.colorOfNext + ' is next.';
    }
  }

  private setTo(x: number, y: number): void {

  }

  private fillBoard(): void {
    //init white figures
    for (let i = 0; i < this.x.length; i++) {
      const element = this.x[i];
      // row 2 - Peasant
      this.chessBase.board.push({
        x: i,
        y: (8 - 2),
        figure: { name: "person", color: "white" }
      });

      // row 1
      if (element === 'a' || element === 'h') {
        // Bastion
        this.chessBase.board.push({
          x: i,
          y: (8 - 1),
          figure: { name: "settings", color: "white" }
        });
      }
      else if (element === 'b' || element === 'g') {
        // Colt
        this.chessBase.board.push({
          x: i,
          y: (8 - 1),
          figure: { name: "savings", color: "white" }
        });
      }
      else if (element === 'c' || element === 'f') {
        // Runner
        this.chessBase.board.push({
          x: i,
          y: (8 - 1),
          figure: { name: "account_circle", color: "white" }
        });
      }
      else if (element === 'd') {
        // Queen
        this.chessBase.board.push({
          x: i,
          y: (8 - 1),
          figure: { name: "grade", color: "white" }
        });
      }
      else if (element === 'e') {
        // King
        this.chessBase.board.push({
          x: i,
          y: (8 - 1),
          figure: { name: "engineering", color: "white" }
        });
      }
    }

    
    //init black figures
    for (let i = 0; i < this.x.length; i++) {
      const element = this.x[i];
      // row 7 - Peasant
      this.chessBase.board.push({
        x: i,
        y: (8 - 7),
        figure: { name: "person", color: "black" }
      });

      // row 8
      if (element === 'a' || element === 'h') {
        // Bastion
        this.chessBase.board.push({
          x: i,
          y: (8 - 8),
          figure: { name: "settings", color: "black" }
        });
      }
      else if (element === 'b' || element === 'g') {
        // Colt
        this.chessBase.board.push({
          x: i,
          y: (8 - 8),
          figure: { name: "savings", color: "black" }
        });
      }
      else if (element === 'c' || element === 'f') {
        // Runner
        this.chessBase.board.push({
          x: i,
          y: (8 - 8),
          figure: { name: "account_circle", color: "black" }
        });
      }
      else if (element === 'd') {
        // Queen
        this.chessBase.board.push({
          x: i,
          y: (8 - 8),
          figure: { name: "grade", color: "black" }
        });
      }
      else if (element === 'e') {
        // King
        this.chessBase.board.push({
          x: i,
          y: (8 - 8),
          figure: { name: "engineering", color: "black" }
        });
      }
    }
  }
}

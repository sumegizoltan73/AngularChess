import { Component, OnInit } from '@angular/core';
import { ChessBase } from './chess-base.';
import { ChessFactory } from './chess.factory';
import './chess.helpers';

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
  private isClickedFrom: boolean = true;
  private step: IStep = { from: null, to: null };

  constructor() { 
    this.chessBase = ChessBase.instance;
    
    this.chessBase.events.subscribe('stepFinished', (eventArgs: any) => { this.onStep(eventArgs); });
    this.chessBase.events.subscribe('stepIllegal', () => { this.clearStep(); });

    this.fillBoard();
  }

  get colorOfNext(): string {
    return (this.isWhiteNext) ? 'white' : 'black';
  }

  get isCheckToWhite(): boolean {
    return this.chessBase.isCheckToWhite;
  }

  get isCheckToBlack(): boolean {
    return this.chessBase.isCheckToBlack;
  }

  ngOnInit(): void {
  }

  onCellClick(x: number, y: number): void {
    if (this.isClickedFrom) {
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

  colorOfFigure(x: number, y: number): string {
    const fig = this.getFigure(x, y);
    
    return (fig) ? fig.color : "";
  }

  classNameOfFigure(x: number, y: number): string {
    const fig = this.getFigure(x, y);
    
    return (fig) ? fig.color + " " + fig.name : "";
  }

  private clearStep(): void {
    this.msg = 'This step is illegal! ' + this.colorOfNext.toUpperCaseFirstLetter() + ' is next.';
    this.step = { from: null, to: null };
    this.isClickedFrom = !this.isClickedFrom;
  }

  private onStep(eventArgs: any): void {
    // TODO: add step to list

    this.step = { from: null, to: null };
    this.isClickedFrom = !this.isClickedFrom;
    this.isWhiteNext = !this.isWhiteNext;
    this.msg = this.colorOfNext.toUpperCaseFirstLetter() + ' is next.';
  }

  private getFigure(x: number, y: number): IFigure | null {
    return this.chessBase.getFigure(x, y);
  }

  private setFrom(x: number, y: number): void {
    const fig = this.getFigure(x, y);

    if (fig && fig.color === this.colorOfNext) {
      this.isClickedFrom = !this.isClickedFrom;
      this.step.from = { x: x, y: y};
      this.msg = this.colorOfNext.toUpperCaseFirstLetter() + ': Click the next cell!';
    }
    else {
      this.msg = 'This step is illegal! ' + this.colorOfNext.toUpperCaseFirstLetter() + ' is next.';
    }
  }

  private setTo(x: number, y: number): void {
    this.step.to = { x: x, y: y};
    const chessBase = ChessBase.instance;
    chessBase.stepAwayIfPossible(this.step);
  }

  private fillBoard(): void {
    //init white figures
    for (let i = 0; i < this.x.length; i++) {
      const element = this.x[i];
      // row 2 - Pawn
      ChessFactory.createFigure("pawn", "white", i, (8 - 2));

      // row 1
      if (element === 'a' || element === 'h') {
        // Rook
        ChessFactory.createFigure("rook", "white", i, (8 - 1));
      }
      else if (element === 'b' || element === 'g') {
        // Knight
        ChessFactory.createFigure("knight", "white", i, (8 - 1));
      }
      else if (element === 'c' || element === 'f') {
        // Bishop
        ChessFactory.createFigure("bishop", "white", i, (8 - 1));
      }
      else if (element === 'd') {
        // Queen
        ChessFactory.createFigure("queen", "white", i, (8 - 1));
      }
      else if (element === 'e') {
        // King
        ChessFactory.createFigure("king", "white", i, (8 - 1));
      }
    }

    
    //init black figures
    for (let i = 0; i < this.x.length; i++) {
      const element = this.x[i];
      // row 7 - Pawn
      ChessFactory.createFigure("pawn", "black", i, (8 - 7));

      // row 8
      if (element === 'a' || element === 'h') {
        // Rook
        ChessFactory.createFigure("rook", "black", i, (8 - 8));
      }
      else if (element === 'b' || element === 'g') {
        // Knight
        ChessFactory.createFigure("knight", "black", i, (8 - 8));
      }
      else if (element === 'c' || element === 'f') {
        // Bishop
        ChessFactory.createFigure("bishop", "black", i, (8 - 8));
      }
      else if (element === 'd') {
        // Queen
        ChessFactory.createFigure("queen", "black", i, (8 - 8));
      }
      else if (element === 'e') {
        // King
        ChessFactory.createFigure("king", "black", i, (8 - 8));
      }
    }
  }
}

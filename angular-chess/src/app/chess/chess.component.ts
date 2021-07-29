import { Component, OnInit } from '@angular/core';

export interface IFigure {
  name: string;
  color: string;
}

export interface ICell {
  x: number;
  y: number;
  figure: IFigure | null;
}

@Component({
  selector: 'app-chess',
  templateUrl: './chess.component.html',
  styleUrls: ['./chess.component.less']
})
export class ChessComponent implements OnInit {

  x: string[] = ['a','b','c','d','e','f','g','h'];
  y: string[] = ['8','7','6','5','4','3','2','1'];

  private board: ICell[] = [];

  constructor() { 
    this.fillBoard();
  }

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
    const cell = this.board.find(function (el) {
      return el.x === x &&
             el.y === (y);
    });

    return (cell && cell.figure)? cell.figure : null;
  }

  private fillBoard(): void {
    //init white figures
    for (let i = 0; i < this.x.length; i++) {
      const element = this.x[i];
      // row 2 - Peasant
      this.board.push({
        x: i,
        y: (8 - 2),
        figure: { name: "person", color: "white" }
      });

      // row 1
      if (element === 'a' || element === 'h') {
        // Bastion
        this.board.push({
          x: i,
          y: (8 - 1),
          figure: { name: "settings", color: "white" }
        });
      }
      else if (element === 'b' || element === 'g') {
        // Colt
        this.board.push({
          x: i,
          y: (8 - 1),
          figure: { name: "savings", color: "white" }
        });
      }
      else if (element === 'c' || element === 'f') {
        // Runner
        this.board.push({
          x: i,
          y: (8 - 1),
          figure: { name: "account_circle", color: "white" }
        });
      }
      else if (element === 'd') {
        // Queen
        this.board.push({
          x: i,
          y: (8 - 1),
          figure: { name: "grade", color: "white" }
        });
      }
      else if (element === 'e') {
        // King
        this.board.push({
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
      this.board.push({
        x: i,
        y: (8 - 7),
        figure: { name: "person", color: "black" }
      });

      // row 8
      if (element === 'a' || element === 'h') {
        // Bastion
        this.board.push({
          x: i,
          y: (8 - 8),
          figure: { name: "settings", color: "black" }
        });
      }
      else if (element === 'b' || element === 'g') {
        // Colt
        this.board.push({
          x: i,
          y: (8 - 8),
          figure: { name: "savings", color: "black" }
        });
      }
      else if (element === 'c' || element === 'f') {
        // Runner
        this.board.push({
          x: i,
          y: (8 - 8),
          figure: { name: "account_circle", color: "black" }
        });
      }
      else if (element === 'd') {
        // Queen
        this.board.push({
          x: i,
          y: (8 - 8),
          figure: { name: "grade", color: "black" }
        });
      }
      else if (element === 'e') {
        // King
        this.board.push({
          x: i,
          y: (8 - 8),
          figure: { name: "engineering", color: "black" }
        });
      }
    }
  }
}

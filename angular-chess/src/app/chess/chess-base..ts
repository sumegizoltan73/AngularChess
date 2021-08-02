import { FigureKing } from './chess-figure-king';
import { FigurePawn } from './chess-figure-pawn';
import { ChessEvents } from './chess.events'
import { ChessFactory } from './chess.factory';

// Singleton class for IBoard items, and events
export class ChessBase {
    private static lock: boolean = false;  
    private static _instance?: ChessBase;

    private revertFigureBuffer: ICell | null = null;
    private revertStepBuffer: IStep | null = null;
    private prisonerRemoved: boolean = false;

    events: ChessEvents;
    board: ICell[] = [];
    
    enPassant: any = null;
    whitePromotionList: string[] = [];
    blackPromotionList: string[] = [];
    isPawnPromotionWhite: boolean = false;
    isPawnPromotionBlack: boolean = false;
    isCheckToWhite: boolean = false;
    isCheckToBlack: boolean = false;

    constructor(){
        this.events = new ChessEvents();
    }

    public static get instance(): ChessBase {
        if (ChessBase._instance == null) {  
            if (!ChessBase.lock) {  
                ChessBase.lock = true;
                if (ChessBase._instance == null) {  
                    ChessBase._instance = new ChessBase();  
                }  
                ChessBase.lock = false;
            }  
        }  
        return ChessBase._instance as ChessBase;
    } 

    getFigure(x: number, y: number): IFigure | null {
        const cell = this.board.find(function (el) {
            return el.x === x &&
                el.y === (y);
        });
    
        return (cell && cell.figure)? cell.figure : null;
    }

    stepAwayIfPossible(step: IStep): void {
        const fig = this.getFigure(step.from!.x, step.from!.y);
        const isPossible = fig?.isStepPossible(step);

        if (isPossible) {
            if (this.enPassant) {
                if (fig && fig.name === 'pawn'
                    && step.to!.x === this.enPassant.to.x
                    && step.to!.y === this.enPassant.to.y) {
                    // remove prisoner
                    this.removePrisoner();
                }
                // en passant just in the next step
                this.enPassant = null;
            }
            const arg = this.stateAfterStep(step);

            this.step(step);
            if (arg && arg.state === 'castling') {
                this.step(arg.additionalStep);
            }
            else if (arg && arg.state === 'en_passant_position') {
                this.enPassant = arg.enPassant;
            }
            else if (arg && arg.state === 'pawn_promotion') {
                if (fig && fig.color === 'white') {
                    this.isPawnPromotionWhite = true;
                }
                else {
                    this.isPawnPromotionBlack = true;
                }
            }

            this.events.emit('stepFinished', arg);
        }
        else {
            this.events.emit('stepIllegal', null);
        }
    }

    stateAfterStep(step: IStep): any {
        // check | castling | en_passant_position | pawn_promotion | null
        let _retVal = null;
        const figFrom = this.getFigure(step.from!.x, step.from!.y);
        
        // is castling?
        if (figFrom?.name == 'rook' && step.from!.y === step.to!.y 
                && ((step.from!.y === 0 && figFrom.color === 'black') || (step.from!.y === 7  && figFrom.color === 'white'))) {
            const xOfKing = (step.from!.x < step.to!.x) ? step.to!.x + 1 : step.to!.x - 1;
            const figToMaybeKing = this.getFigure(xOfKing, step.to!.y);
            if (figToMaybeKing && figToMaybeKing.name === 'king') {
                if ((<FigureKing> figToMaybeKing).isOrigPosition({ from: { x: xOfKing, y: step.from!.y }, to: null })) {
                    const xOfKingTo = (step.from!.x < step.to!.x) ? step.to!.x - 1 : step.to!.x + 1;
                    _retVal = { 
                        state: 'castling', 
                        additionalStep: { 
                            from: { x: xOfKing, y: step.from!.y }, 
                            to: { x: xOfKingTo, y: step.from!.y }
                        } 
                    };
                }
            }
        }

        if (figFrom?.name === 'pawn') {
            if ((<FigurePawn> figFrom).isMovedToEnPassantPosition(step)) {
                // en_passant_position
                const offsetY = (step.to!.y > step.from!.y) ? -1 : 1;
                _retVal = { 
                    state: 'en_passant_position', 
                    enPassant: { 
                        prisoner: { x: step.to!.x, y: step.to!.y }, 
                        to: { x: step.to!.x, y: step.to!.y + offsetY }
                    } 
                };
            }
            else if ((figFrom.color === 'white' && step.to!.y === 0 && this.whitePromotionList.length > 0)
                    || figFrom.color === 'black' && step.to!.y === 7 && this.blackPromotionList.length > 0) {
                // pawn promotion
                _retVal = { 
                    state: 'pawn_promotion'
                };
            }
        }

        return _retVal;
    }

    convertPawn(name: string, color: string, step: IStep, i: number): void {
        if (color === 'white') {
            this.isPawnPromotionWhite = false;
            this.whitePromotionList.splice(i, 1);
        }
        else {
            this.isPawnPromotionBlack = false;
            this.blackPromotionList.splice(i, 1);
        }
        
        this.removeFigure(step.to!.x, step.to!.y);
        ChessFactory.createFigure(name, color, step.to!.x, step.to!.y);

        this.events.emit('promotionFinished', null);
    }
    
    private removePrisoner(): void {
        const figTo = this.getFigure(this.enPassant.prisoner.x, this.enPassant.prisoner.y);
        if (figTo) {
            this.revertFigureBuffer = {
                x: this.enPassant.prisoner.x,
                y: this.enPassant.prisoner.y,
                figure: figTo
            };
            this.removeFigure(this.enPassant.prisoner.x, this.enPassant.prisoner.y);
            this.prisonerRemoved = true;
        }
    }

    private step(step: IStep): void {
        const figTo = this.getFigure(step.to!.x, step.to!.y);
        if (figTo) {
            this.revertFigureBuffer = {
                x: step.to!.x,
                y: step.to!.y,
                figure: figTo
            };
            this.removeFigure(step.to!.x, step.to!.y);

            if (figTo.name !== 'pawn') {
                if (figTo.color === 'white') {
                    this.whitePromotionList.push(figTo.name);
                }
                else {
                    this.blackPromotionList.push(figTo.name);
                }
            }
        }
        else if (this.prisonerRemoved) {
            this.prisonerRemoved = false;
        }
        else {
            this.revertFigureBuffer = null;
        }

        this.revertStepBuffer = { from: step.to, to: step.from };

        const fig = this.getFigure(step.from!.x, step.from!.y);
        
        if (fig?.name === 'king') {
            (<FigureKing> fig).isMoved = true;
        }

        this.board.push({
            x: step.to!.x,
            y: step.to!.y,
            figure: fig
        });
        this.removeFigure(step.from!.x, step.from!.y);
        
        // emit for displaying steps
        this.events.emit('step', step);
    }

    private removeFigure(x: number, y: number): void {
        const cell = this.board.find(function (el) {
            return el.x === x &&
                el.y === (y);
        });
        if (cell) {
            const index = this.board.indexOf(cell);
            this.board.splice(index, 1);
        }
    }

}
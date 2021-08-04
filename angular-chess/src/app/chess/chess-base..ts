import { FigureKing } from './chess-figure-king';
import { FigurePawn } from './chess-figure-pawn';
import { ChessEvents } from './chess.events'
import { ChessFactory } from './chess.factory';

// Singleton class for IBoard items, and events
export class ChessBase {
    private static lock: boolean = false;  
    private static _instance?: ChessBase;

    private revertFigureBuffer: ICell | null = null;
    private prisonerRemoved: boolean = false;
    private checkFiguresWithCell: ICell[] = [];

    events: ChessEvents;
    board: ICell[] = [];
    virtualboard: ICell[] = [];     // for check (etc.) detection with virtual steps
    
    enPassant: any = null;
    whitePromotionList: string[] = [];
    blackPromotionList: string[] = [];
    isPawnPromotionWhite: boolean = false;
    isPawnPromotionBlack: boolean = false;
    isCheckToWhite: boolean = false;
    isCheckToBlack: boolean = false;
    isCheckMateToWhite: boolean = false;
    isCheckMateToBlack: boolean = false;
    isLoaderVisible: boolean = false;
    isHitEnemyKingCanBeTested: boolean = false;
    isTestInProgress: boolean = false;

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
        this.isLoaderVisible = true;
        this.isHitEnemyKingCanBeTested = false;

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
            if (arg && arg.state === 'castling' && (!this.isCheckToKing(fig!.color))) {
                // castling is not possible in chess
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

            try {
                // if stay in check then revert, and throw stepillegal
                this.isHitEnemyKingCanBeTested = true;
                this.testCheck(fig!.color, true);

                // if errorCode == 0 (no_error)
                if (fig!.color === 'white') {
                    this.isCheckToWhite = false;
                }
                else {
                    this.isCheckToBlack = false;
                }
                this.isHitEnemyKingCanBeTested = false;
                this.isLoaderVisible = false;
                this.events.emit('stepFinished', arg);
            }
            catch (ex) {
                this.isHitEnemyKingCanBeTested = false;

                // if errorCode == 1 (stay_in_check)
                this.revertStep(step);
                this.isLoaderVisible = false;
                this.events.emit('stepIllegal', null);
            }
        }
        else {
            this.isLoaderVisible = false;
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

    processCombinatedTests(color: string): void {
        this.isTestInProgress = true;
        this.isLoaderVisible = true;
        this.isHitEnemyKingCanBeTested = true;

        this.testCheck(color, false, true, true);

        const isCheck: boolean = (color === 'white') ? this.isCheckToWhite : this.isCheckToBlack;
        
        if (isCheck) {
            // can step away || can block || can hit (if one figure)   
            let checkmate : boolean = true;
            let testCase: string[] = ['can_step_away', 'can_block', 'can_hit'];
            
            for (let i = 0; i < testCase.length; i++) {
                const element = testCase[i];
                
                switch (element) {
                    case 'can_step_away':
                        checkmate = false;  // TODO: this.canStepAway(color)
                        break;

                    case 'can_block':
                        checkmate = false;  // TODO: this.canBlock(color)
                        break;

                    case 'can_hit':
                        checkmate = false;  // TODO: this.canHit(color)
                        break;
                
                    default:
                        break;
                }

                if (!checkmate) {
                    break;
                }
            }

            this.clearTestVariables();

            if (checkmate) {
                this.isCheckMateToWhite = (color === 'white');
                this.isCheckMateToBlack = (color === 'black');
                this.events.emit('checkmate', null);
            }
        }
        else {
            // TODO: stalemate

            // TODO: dead position

            this.clearTestVariables();
        }
    }

    getKingWithCell(color: string): ICell {
        const cell = this.board.find(function (el) {
            return el.figure?.color === color &&
                el.figure.name === 'king';
        });
    
        return cell as ICell;
    }
    
    private clearTestVariables(): void {
        this.isTestInProgress = false;
        this.isLoaderVisible = false;
        this.isHitEnemyKingCanBeTested = false;
    }

    private revertStep(step: IStep): void {
        const fig = this.getFigure(step.to!.x, step.to!.y);
        
        this.removeFigure(step.to!.x, step.to!.y);
        this.board.push({
            x: step.from!.x,
            y: step.from!.y,
            figure: fig
        });

        if (this.revertFigureBuffer) {
            this.board.push({
                x: this.revertFigureBuffer.x,
                y: this.revertFigureBuffer.y,
                figure: this.revertFigureBuffer.figure
            });

            if (this.revertFigureBuffer.figure?.name !== 'pawn') {
                let i = -1;
                const arr = (this.revertFigureBuffer.figure?.color === 'white') ? this.whitePromotionList : this.blackPromotionList;
                for (let j = 0; j < arr.length; j++) {
                    const element = arr[j];
                    if (element === this.revertFigureBuffer.figure?.name) {
                        i = j;
                        break;
                    }
                }

                if (this.revertFigureBuffer.figure?.color === 'white') {
                    this.whitePromotionList.splice(i, 1);
                }
                else {
                    this.blackPromotionList.splice(i, 1);
                }
            }

            this.prisonerRemoved = false;
            this.revertFigureBuffer = null;
        }
    }
    
    private testCheck(color: string, throwOnCheck?: boolean, setVariables?: boolean, saveFigures?: boolean): void {
        let isCheck: boolean = false;
        const kingWithCell: ICell = this.getKingWithCell(color);
        const stepForCheck: IStep = {
            from: null,
            to: {
                x: kingWithCell.x,
                y: kingWithCell.y
            }
        };

        this.checkFiguresWithCell = [];

        for (let i = 0; i < this.board.length; i++) {
            const element = this.board[i];
            
            if (element.figure?.color !== color && element.figure?.name !== 'king') {
                const step = {
                    from: { x: element.x, y: element.y },
                    to: stepForCheck.to
                };

                const isCheckFromFigure = element.figure!.isStepPossible(step);
                isCheck = isCheck || isCheckFromFigure;

                if (isCheckFromFigure && saveFigures !== true) {
                    break;
                }
                else if (isCheckFromFigure && saveFigures === true) {
                    this.checkFiguresWithCell.push(element);
                }
            }
        }

        if (isCheck) {
            if (setVariables === true) {
                this.isCheckToWhite = (color === 'white');
                this.isCheckToBlack = (color === 'black');
            }

            if (throwOnCheck === true) {
                throw new Error('Check occured!');
            }
        }
    }

    private isCheckToKing(color: string): boolean {
        return (color === 'white') ? this.isCheckToWhite : this.isCheckToBlack;
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
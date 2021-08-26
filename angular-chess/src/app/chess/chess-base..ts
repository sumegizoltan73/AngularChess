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
    private isVirtualizeBoard: boolean = false;
    private _board: ICell[] = [];
    private _virtualboard: ICell[] = [];     // for check (etc.) detection with virtual steps

    events: ChessEvents;
    
    enPassant: any = null;
    whitePromotionList: string[] = [];
    blackPromotionList: string[] = [];
    isPawnPromotionWhite: boolean = false;
    isPawnPromotionBlack: boolean = false;
    isCheckToWhite: boolean = false;
    isCheckToBlack: boolean = false;
    isCheckMateToWhite: boolean = false;
    isCheckMateToBlack: boolean = false;
    isWhiteResigned: boolean = false;
    isBlackResigned: boolean = false;
    isLoaderVisible: boolean = false;
    isHitEnemyKingCanBeTested: boolean = false;
    isTestInProgress: boolean = false;

    get board(): ICell[] {
        return (this.isVirtualizeBoard) ? this._virtualboard : this._board;
    }
    set board(value: ICell[]) {
        if (this.isVirtualizeBoard) {
            this._virtualboard = value;
        }
        else {
            this._board = value;
        }
    }

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

    stepFromRemote(step: IStep, enPassant: any): void {
        const fig = this.getFigure(step.from!.x, step.from!.y);
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
        this.step(step);

        if (enPassant) {
            this.enPassant = enPassant;
        }
    }

    stepAwayIfPossible(step: IStep): void {
        this.isLoaderVisible = true;
        this.isHitEnemyKingCanBeTested = false;

        const fig = this.getFigure(step.from!.x, step.from!.y);
        const isPossible = fig?.isStepPossible(step);
        let strike = false;

        if (isPossible) {
            if (this.enPassant) {
                if (fig && fig.name === 'pawn'
                    && step.to!.x === this.enPassant.to.x
                    && step.to!.y === this.enPassant.to.y) {
                    // remove prisoner
                    this.removePrisoner();
                    strike = true;
                }
                // en passant just in the next step
                this.enPassant = null;
            }

            let arg = this.stateAfterStep(step);

            const strikeInStep = this.step(step);
            strike = strike || strikeInStep;

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
                if (!arg) arg = {};
                arg['color'] = fig?.color;
                arg['step'] = step;
                arg['strike'] = strike;
                arg['fig'] = fig?.name;
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

    convertPawnFromRemote(name: string, color: string, step: IStep): void {
        this.removeFigure(step.to!.x, step.to!.y);
        ChessFactory.createFigure(name, color, step.to!.x, step.to!.y);
    }

    testCheckForRemote(color: string): void {
        this.testCheck(color, false, true, false);
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
                        checkmate = !this.canStepAway(color);
                        break;

                    case 'can_block':
                        checkmate = !this.canBlock(color);
                        break;

                    case 'can_hit':
                        checkmate = !this.canHit(color);
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

    resign(color: string): void {
        if (color === 'white') {
            this.isWhiteResigned = true;
        }
        else {
            this.isBlackResigned = true;
        }

        this.events.emit('resign', null);
    }

    private canStepAway(color: string): boolean {
        let _retVal = false;

        const cell = this.getKingWithCell(color);
        const from: ICord = { x: cell.x, y: cell.y }; 
        const arr: ICord[] = (<FigureKing> cell.figure).getRange(cell.x, cell.y);
        for (let i = 0; i < arr.length; i++) {
            const element = arr[i];
            const step: IStep = {
                from: from,
                to: { x: element.x, y: element.y }
            }; 
            if (cell.figure!.isStepPossible(step)) {
                this.prepareVirtualBoard(step, cell.figure!);

                try {
                    this.testCheck(color, true, false, false);

                    _retVal = true;
                    break;
                }
                catch (ex) {
                    _retVal = false;
                }

            }
        }

        this.isHitEnemyKingCanBeTested = false;
        this.isVirtualizeBoard = false;

        return _retVal;
    }

    private canBlock(color: string): boolean {
        let _retVal = false;

        if (this.checkFiguresWithCell.length < 2) {
            const attackerCell = this.checkFiguresWithCell[0];
            const cell = this.getKingWithCell(color);
            if (attackerCell.figure?.name !== 'knight'
                && (Math.abs(attackerCell.x - cell.x) > 1
                    || Math.abs(attackerCell.y - cell.y) > 1)) {
                const defenseZone = this.getDefenseZone(cell, attackerCell);

                for (let i = 0; i < this.board.length; i++) {
                    const element = this.board[i];
                    
                    if (element.figure?.color === color && element.figure.name !== 'king'){
                        const from: ICord = { x: element.x, y: element.y }; 

                        for (let j = 0; j < defenseZone.length; j++) {
                            const dz = defenseZone[j];
                            const step: IStep = {
                                from: from,
                                to: { x: dz.x, y: dz.y }
                            }; 
                            if (element.figure!.isStepPossible(step)) {
                                this.prepareVirtualBoard(step, element.figure);

                                try {
                                    this.testCheck(color, true, false, false);

                                    _retVal = true;
                                    break;
                                }
                                catch (ex) {
                                    _retVal = false;
                                    this.isVirtualizeBoard = false;
                                }
                            }
                        }

                        if (_retVal) {
                            break;
                        }
                    }
                }

            }
        }

        this.isHitEnemyKingCanBeTested = false;
        this.isVirtualizeBoard = false;

        return _retVal;
    }

    private canHit(color: string): boolean {
        let _retVal = false;

        if (this.checkFiguresWithCell.length < 2) {
            const attackerCell = this.checkFiguresWithCell[0];
            const cell = this.getKingWithCell(color);
            
            for (let i = 0; i < this.board.length; i++) {
                const element = this.board[i];
                
                if (element.figure?.color === color){
                    const from: ICord = { x: element.x, y: element.y }; 
                    const step: IStep = {
                        from: from,
                        to: { x: attackerCell.x, y: attackerCell.y }
                    }; 
                    if (element.figure!.isStepPossible(step)) {
                        this.prepareVirtualBoard(step, element.figure);

                        try {
                            this.testCheck(color, true, false, false);

                            _retVal = true;
                            break;
                        }
                        catch (ex) {
                            _retVal = false;
                            this.isVirtualizeBoard = false;
                        }
                    }

                    if (_retVal) {
                        break;
                    }
                }
            }
        }

        this.isHitEnemyKingCanBeTested = false;
        this.isVirtualizeBoard = false;

        return _retVal;
    }

    private prepareVirtualBoard(step: IStep, fig: IFigure): void {
        // if possible -> copy to virtual, step in virtual, testCheck(virtual)
        this.isVirtualizeBoard = true;
        this._virtualboard = this._board.slice();
        this.removeFigure(step.from!.x, step.from!.y);
        this.removeFigure(step.to!.x, step.to!.y);
        this._virtualboard.push({
            x: step.to!.x,
            y: step.to!.y,
            figure: fig
        });
        this.isHitEnemyKingCanBeTested = true;
    }

    private getDefenseZone(cell1: ICell, cell2: ICell): ICord[] {
        let _retVal: ICord[] = [];
        const lengthX = Math.abs(cell2.x - cell1.x);
        const lengthY = Math.abs(cell2.y - cell1.y);
        const j = (lengthX >= lengthY) ? lengthX : lengthY;
        const increaseX = (lengthX > 0) ? (cell2.x - cell1.x) / lengthX : 0;
        const increaseY = (lengthY > 0) ? (cell2.y - cell1.y) / lengthY : 0;

        for (let i = 1; i < j; i++) {
            _retVal.push({ x: cell1.x + (i * increaseX), y: cell1.y + (i * increaseY)});
        }

        return _retVal;
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

        if (saveFigures === true) {
            this.checkFiguresWithCell = [];
        }

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
        else {
            if (setVariables === true) {
                this.isCheckToWhite = (color === 'white') ? false: this.isCheckToWhite;
                this.isCheckToBlack = (color === 'black') ? false: this.isCheckToBlack;
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

    private step(step: IStep): boolean {
        let _retVal = false;
        const figTo = this.getFigure(step.to!.x, step.to!.y);
        if (figTo) {
            this.revertFigureBuffer = {
                x: step.to!.x,
                y: step.to!.y,
                figure: figTo
            };
            this.removeFigure(step.to!.x, step.to!.y);
            _retVal = true;

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

        return _retVal;
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
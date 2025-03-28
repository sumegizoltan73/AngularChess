import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ChessBase } from './chess-base.';
import { ChessFactory } from './chess.factory';
import './chess.helpers';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from './localstorage.service';

export class StepDetail implements IStepDetail {
  
  private x: string[] = ['a','b','c','d','e','f','g','h'];
  private y: string[] = ['8','7','6','5','4','3','2','1'];

  constructor(public step: IStep, public additionalStep: IStep | null, public fig: string,
      public isStrike: boolean = false, public isCheck: boolean = false, public isCheckMate: boolean = false,
      public isShowFromX: boolean = false,  public isShowFromY: boolean = false) {
    if (this.additionalStep) {
      this.isShowFromX = false;
      this.isShowFromY = false;
    }
  }

  get figure(): string {
    let _retVal = this.fig;

    if (this.fig === 'pawn') {
      _retVal = '';
    }
    else if (this.additionalStep) {
      _retVal = 'king';
    }

    return _retVal;
  }

  get castling(): string {
    let _retVal = '';

    if (this.additionalStep) {
      _retVal = (this.additionalStep.to?.x === 6) ? ' 0-0': ' 0-0-0';
    }

    return _retVal;
  }

  get notation(): string {
    let _retVal = '';

    if ((!this.figure && this.isStrike) || this.isShowFromX || this.isShowFromY) {
      _retVal += (this.step) ? this.x[this.step.from!.x] : '';
    }
    if (this.isShowFromY) {
      _retVal += (this.step) ? this.y[this.step.from!.y] : '';
    }
    if (this.isStrike) {
      _retVal += 'x';
    }
    _retVal += (this.step) ? this.x[this.step.to!.x] : '';
    _retVal += (this.step) ? this.y[this.step.to!.y] : '';
    _retVal += this.castling;
    if (!this.isCheckMate && this.isCheck) {
      _retVal += '+';
    }
    if (this.isCheckMate) {
      _retVal += '#';
    }

    return _retVal;
  }
} 

@Component({
    selector: 'app-chess',
    templateUrl: './chess.component.html',
    styleUrls: ['./chess.component.less'],
    standalone: false
})
export class ChessComponent implements OnInit, OnDestroy {

  x: string[] = ['a','b','c','d','e','f','g','h'];
  y: string[] = ['8','7','6','5','4','3','2','1'];
  msg: string = '';
  joinMsg: string = '';
  roomNameForCreate: string = '';
  roomNameForJoin: string = '';
  PINForJoin: string = '';
  nameForChat: string = '';
  messageForChat: string = '';
  nameForSave: string = '';
  socket;
  steps: IStepNotation[] = [];
  chatMessages: IChatMessage[] = [];
  gameList: IGameListItem[] = [];

  private chessBase: ChessBase;
  private isWhiteNext: boolean = true;
  private isClickedFrom: boolean = true;
  private step: IStep = { from: null, to: null };
  private isGameStarted: boolean = false;
  private isSinglePlayerGame: boolean = true;
  private isMultiPlayerGameCreated: boolean = false;
  private isMultiPlayerRoomCreated: boolean = false;
  private isRemoteBlackGamerJoined: boolean = false;
  private isJoinedAsGamer: boolean = false;
  private isJoinedAsViewer: boolean = false;
  private localGamers: string[] = ['white', 'black'];
  private socketId: string = '';
  private isSaveGameEnabled: boolean = false;
  private isLoadGameEnabled: boolean = false;
  private isLocaleLoaded: boolean = false;
  private gameListSelectedItem: number = -1;

  constructor(private _localStorage: LocalStorageService) { 
    this.chessBase = ChessBase.instance;
    
    this.chessBase.events.subscribe('stepFinished', (eventArgs: any) => { this.onStep(eventArgs); });
    this.chessBase.events.subscribe('stepIllegal', () => { this.clearStep(); });
    this.chessBase.events.subscribe('promotionFinished', () => { this.onPromotion(); });
    this.chessBase.events.subscribe('checkmate', () => { this.onCheckMate(); });
    this.chessBase.events.subscribe('resign', () => { this.onResign(); });

    this.fillBoard();

    this.socket = io(environment.SOCKET_ENDPOINT, {
      transports: ["polling", "websocket"]
    });

    this.socket.on('game-created', (PIN: string) => {
      if (PIN) {
        this.isMultiPlayerRoomCreated = true;
        this.PINForJoin = PIN;
      }
    });

    this.socket.on('gamer-joined', () => {
      this.isGameStarted = true;
      if (this.localGamers.includes('white')) {
        this.isRemoteBlackGamerJoined = true;
      }

      this.msg = this.colorOfNext.toUpperCaseFirstLetter() + ' is next.';
    });

    this.socket.on('viewer-joined', (isStarted: boolean) => {
      this.isGameStarted = isStarted;
    });

    this.socket.on('id', (socketId: string, isBoardChanged: boolean) => {
      this.socketId = socketId;

      if (isBoardChanged) {
        this.socket.emit('get-board', this.roomNameForJoin, this.PINForJoin, this.socketId);
      }
    });

    this.socket.on('get-board-to', (socketId: string) => {
      if (this.colorOfLocalGamer === 'White') {
        this.socket.emit('board', this.roomNameForCreate, this.PINForJoin, socketId, 
            this.chessBase.board, this.steps, this.colorOfNext, this.isWhiteResigned, this.isBlackResigned);
      }
    });

    this.socket.on('board-to', (board: ICell[], steps: IStepNotation[], colorOfNext: string, isWhiteResigned: boolean, isBlackResigned: boolean) => {
      this.onSyncronize(board, steps, colorOfNext, isWhiteResigned, isBlackResigned);
    });

    this.socket.on('board-to-all', (board: ICell[], steps: IStepNotation[], colorOfNext: string, isWhiteResigned: boolean, isBlackResigned: boolean) => {
      if (!this.isLocaleLoaded) {
        this.onSyncronize(board, steps, colorOfNext, isWhiteResigned, isBlackResigned);
      }
      this.isLocaleLoaded = false;
    });

    this.socket.on('invalid-room', () => {
      this.isJoinedAsGamer = false;
      this.isJoinedAsViewer = false;
      this.localGamers = ['white', 'black'];
      this.joinMsg = 'Invalid room or PIN!';
    });

    this.socket.on('invalid-gamer', () => {
      this.isJoinedAsGamer = false;
      this.localGamers = ['white', 'black'];
      this.joinMsg = 'Invalid gamer! (All players have already joined this room.)';
    });

    this.socket.on('step-to', (eventArgs) => {
      if (!this.localGamers.includes(eventArgs.color)){
        this.chessBase.stepFromRemote(eventArgs.step, eventArgs.enPassant);

        if ('additionalStep' in eventArgs) {
          this.chessBase.stepFromRemote(eventArgs.additionalStep, null);
        }

        if (eventArgs.state && eventArgs.state === 'pawn_promotion') {
          this.msg = this.colorOfNext.toUpperCaseFirstLetter() + ' is next. We are waiting for the pawn to convert.';
        }
        else {
          this.isWhiteNext = !this.isWhiteNext;
          this.msg = this.colorOfNext.toUpperCaseFirstLetter() + ' is next.';

          // test check, checkmate, dead position, stalemate
          if (this.isCheckToWhite || this.isCheckToBlack) {
            this.chessBase.testCheckForRemote(eventArgs.color);  
          }
          this.chessBase.processCombinatedTests(this.colorOfNext);
        }

        this.setStepNotation(eventArgs);
      }
    });

    this.socket.on('pawn-converted', (name, color, step) => {
      if (!this.localGamers.includes(color)){
        this.chessBase.convertPawnFromRemote(name, color, step);

        this.isWhiteNext = !this.isWhiteNext;
        this.msg = this.colorOfNext.toUpperCaseFirstLetter() + ' is next.';

        // test check, checkmate, dead position, stalemate
        this.chessBase.processCombinatedTests(this.colorOfNext);
      }
    });

    this.socket.on('message-sended', (player, name, socketId, message) => {
      const chatmessage: IChatMessage = {
        player: player,
        name: name,
        message: message,
        isOwnMessage: (this.socketId === socketId)
      };
      this.chatMessages.push(chatmessage);
    });
  }

  get colorOfNext(): string {
    return (this.isWhiteNext) ? 'white' : 'black';
  }

  get isNextLocalGamer(): boolean {
    return this.localGamers.includes(this.colorOfNext);
  }

  get colorOfWinner(): string {
    return (this.isCheckMateToWhite || this.isWhiteResigned) ? 'black' : (this.isCheckMateToBlack || this.isBlackResigned) ? 'white' : '';
  }

  get colorOfLocalGamer(): string {
    let _retVal = '';
    if (this.isMultiPlayer && (this.isJoinedAsGamer || this.isMultiPlayerGameCreated)) {
      _retVal = this.localGamers[0].toUpperCaseFirstLetter();
    }
    return _retVal;
  }

  get isCheckToWhite(): boolean {
    return this.chessBase.isCheckToWhite;
  }

  get isCheckToBlack(): boolean {
    return this.chessBase.isCheckToBlack;
  }

  get isCheckMateToWhite(): boolean {
    return this.chessBase.isCheckMateToWhite;
  }

  get isCheckMateToBlack(): boolean {
    return this.chessBase.isCheckMateToBlack;
  }

  get isWhiteResigned(): boolean {
    return this.chessBase.isWhiteResigned;
  }

  get isBlackResigned(): boolean {
    return this.chessBase.isBlackResigned;
  }

  get isExistsInfoToWhite(): boolean {
    return this.isCheckToWhite || this.isCheckMateToWhite || this.isWhiteResigned;
  }

  get isExistsInfoToBlack(): boolean {
    return this.isCheckToBlack || this.isCheckMateToBlack || this.isBlackResigned;
  }

  get infoToWhite(): string {
    let _retVal = '';
    
    if (this.isCheckMateToWhite) {
      _retVal = 'Checkmate!';
    }
    else if (this.isCheckToWhite) {
      _retVal = 'Check!';
    }
    else if (this.isWhiteResigned) {
      _retVal = 'Resigned!';
    }

    return _retVal;
  }

  get infoToBlack(): string {
    let _retVal = '';
    
    if (this.isCheckMateToBlack) {
      _retVal = 'Checkmate!';
    }
    else if (this.isCheckToBlack) {
      _retVal = 'Check!';
    }
    else if (this.isBlackResigned) {
      _retVal = 'Resigned!';
    }

    return _retVal;
  }

  get isGameEnded(): boolean {
    // checkmate || resigning
    return this.isCheckMateToWhite || this.isCheckMateToBlack || this.isWhiteResigned || this.isBlackResigned;
  }

  get isStarted(): boolean {
    return this.isGameStarted;
  }

  get isWhiteResignDisabled(): boolean {
    return !this.localGamers.includes('white');
  }

  get isBlackResignDisabled(): boolean {
    return !this.localGamers.includes('black');
  }

  get isSinglePlayer(): boolean {
    return this.isSinglePlayerGame;
  }

  set isSinglePlayer(value: boolean) {
    if (this.isSinglePlayerGame != value){
      this.isSinglePlayerGame = value;
    }
  }

  get isMultiPlayer(): boolean {
    return !this.isSinglePlayerGame;
  }

  get isPlayerModeSelectionDisabled(): boolean {
    return this.isMultiPlayerGameCreated || this.isMultiplayerCreateOptionsDisabled;
  }

  get isMultiplayerJoinOptionsDisabled(): boolean {
    return this.isMultiPlayerGameCreated;
  }

  get isMultiplayerCreateOptionsDisabled(): boolean {
    return this.isJoinedAsGamer || this.isJoinedAsViewer;
  }

  get isJoinDisabled(): boolean {
    return this.isJoinedAsGamer || this.isJoinedAsViewer;
  }

  get isViewerJoined(): boolean {
    return this.isJoinedAsViewer;
  }

  get isRoomCreated(): boolean {
    return this.isMultiPlayerRoomCreated;
  }

  get isBlackGamerJoined(): boolean {
    return this.isRemoteBlackGamerJoined;
  }

  get isPromoteWhite(): boolean {
    return this.chessBase.isPawnPromotionWhite;
  }

  get isPromoteBlack(): boolean {
    return this.chessBase.isPawnPromotionBlack;
  }

  get isLoaderVisible(): boolean {
    return this.chessBase.isLoaderVisible;
  }

  get isTestInProgress(): boolean {
    return this.chessBase.isTestInProgress;
  }

  get blackPromotionList(): string[] {
    return this.chessBase.blackPromotionList;
  }

  get whitePromotionList(): string[] {
    return this.chessBase.whitePromotionList;
  }

  get isSaveDetailVisible(): boolean {
    return this.isSaveGameEnabled;
  }

  get isLoadDetailVisible(): boolean {
    return this.isLoadGameEnabled;
  }

  get isSaveAndLoadVisible(): boolean {
    return !(this.isSaveDetailVisible || this.isLoadDetailVisible);
  }

  get isGameSelectedForLoad(): boolean {
    return this.gameListSelectedItem > -1;
  }

  get selectedItemForLoad(): number {
    return this.gameListSelectedItem;
  }

  ngOnInit(): void {
  }
  
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload($event: any) {
    this.ngOnDestroy();
    $event.preventDefault(); 
    delete $event['returnValue'];
  }

  async ngOnDestroy() {
    if (this.isMultiPlayer) {
      this.msg = 'Disconnecting...';
    }
  }

  onCellClick(x: number, y: number): void {
    const isStepEnabled = (this.isStarted && this.isNextLocalGamer) || this.isSinglePlayer;

    if (!(this.isPromoteWhite || this.isPromoteBlack || this.isTestInProgress || this.isGameEnded) && isStepEnabled) {
      if (this.isClickedFrom) {
        this.setFrom(x, y);
      }
      else {
        this.setTo(x, y);
      }
    }
  }

  onPromotionClick(name: string, i: number): void {
    const color = (this.isPromoteWhite) ? 'white' : 'black';

    if (this.isMultiPlayer && this.localGamers.includes(color)) {
      const roomName: string = (color === 'white') ? this.roomNameForCreate : this.roomNameForJoin;
      this.socket.emit('convert-pawn', roomName, this.PINForJoin, name, color, this.step);
    }
    
    this.chessBase.convertPawn(name, color, this.step, i);
  }

  onResignClick(color: string): void {
    this.chessBase.resign(color);
  }

  onCreateGameClick(): void {
    if (!this.isMultiPlayerGameCreated && this.roomNameForCreate) {
      this.isMultiPlayerGameCreated = true;
      const i = this.localGamers.indexOf('black');
      this.localGamers.splice(i, 1);
      this.socket.emit('start-game', this.roomNameForCreate);
    }
  }

  onJoinAsGamerClick(): void {
    if (!(this.isJoinedAsGamer || this.isJoinedAsViewer) && this.roomNameForJoin && this.PINForJoin && this.PINForJoin.length === 4) {
      this.isJoinedAsGamer = true;
      this.joinMsg = '';
      const i = this.localGamers.indexOf('white');
      this.localGamers.splice(i, 1);
      this.socket.emit('join', this.roomNameForJoin, this.PINForJoin, false);
    }
  }

  onJoinAsViewerClick(): void {
    if (!(this.isJoinedAsGamer || this.isJoinedAsViewer) && this.roomNameForJoin && this.PINForJoin && this.PINForJoin.length === 4) {
      this.isJoinedAsViewer = true;
      this.joinMsg = '';
      this.localGamers = [];
      this.socket.emit('join', this.roomNameForJoin, this.PINForJoin, true);
    }
  }

  onSendMessageClick(): void {
    const roomName: string = (this.roomNameForCreate) ? this.roomNameForCreate : this.roomNameForJoin;
    this.socket.emit('message', roomName, this.PINForJoin, this.colorOfLocalGamer.toLowerCaseFirstLetter(), this.nameForChat, this.socketId, this.messageForChat);
    this.messageForChat = '';
  }

  onSaveGameClick(): void {
    this.nameForSave = '';
    this.isSaveGameEnabled = true;
  }

  onLoadGameClick(): void {
    this.gameList = this._localStorage.getList();
    this.gameListSelectedItem = -1;
    this.isLoadGameEnabled = true;
  }

  onSaveClick(): void {
    // save
    const data = { 
      board: this.chessBase.board, 
      steps: this.steps, 
      next: this.colorOfNext, 
      isWhiteResigned: this.isWhiteResigned, 
      isBlackResigned: this.isBlackResigned,
      date: new Date().toJSON().slice(0,16).replace('T', ' ')
    };
    this._localStorage.setItem(this.nameForSave, data);
    this.isSaveGameEnabled = false;
  }

  onLoadClick(): void {
    const name = this.gameList[this.gameListSelectedItem].name;
    const data = this._localStorage.loadItem(name);

    if (data) {
      this.onSyncronize(data.board, data.steps, data.next, data.isWhiteResigned, data.isBlackResigned);

      if (this.isMultiPlayer) {
        this.isLocaleLoaded = true;
        const roomName: string = (this.roomNameForCreate) ? this.roomNameForCreate : this.roomNameForJoin;
        this.socket.emit('board-loaded', roomName, this.PINForJoin, 
              this.chessBase.board, this.steps, this.colorOfNext, this.isWhiteResigned, this.isBlackResigned);
      }
    }

    this.isLoadGameEnabled = false;
  }

  onSelectGameClick(i: number): void {
    this.gameListSelectedItem = i;
  }

  gameModeChange(e: Event): void {
    this.isSinglePlayerGame = ((<HTMLInputElement> e.target).id === 'singlePlayer');
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

  classNameOfPromotion(name: string, color: string): string {
    return color + " " + name;
  }

  private clearStep(): void {
    this.msg = 'This step is illegal! ' + this.colorOfNext.toUpperCaseFirstLetter() + ' is next.';
    this.step = { from: null, to: null };
    this.isClickedFrom = !this.isClickedFrom;
  }

  private onStep(eventArgs: any): void {
    // TODO: add step to list

    if (eventArgs && eventArgs.state === 'pawn_promotion') {
      this.msg = this.colorOfNext.toUpperCaseFirstLetter() + ' is next. Convert the pawn to another!';
    }
    else {
      this.step = { from: null, to: null };
      this.isClickedFrom = !this.isClickedFrom;
      this.isWhiteNext = !this.isWhiteNext;
      this.msg = this.colorOfNext.toUpperCaseFirstLetter() + ' is next.';

      // test check, checkmate, dead position, stalemate
      this.chessBase.processCombinatedTests(this.colorOfNext);
    }

    this.setStepNotation(eventArgs);

    if (eventArgs && this.isMultiPlayer && this.localGamers.includes(eventArgs.color)){
      const roomName: string = (eventArgs.color === 'white') ? this.roomNameForCreate : this.roomNameForJoin;
      this.socket.emit('step', roomName, this.PINForJoin, eventArgs);
    }
  }

  private setStepNotation(eventArgs: any): void {
    if (eventArgs) {
      if (eventArgs.color === 'white') {
        // new notation
        const item: IStepNotation = { 
          white: new StepDetail(
            eventArgs.step,
            eventArgs.additionalStep ? eventArgs.additionalStep : null,
            eventArgs.fig,
            eventArgs.strike,
            this.isCheckToBlack,
            this.isCheckMateToBlack,
            this.getShowFromX(eventArgs.fig, 'white', eventArgs.step),
            this.getShowFromY(eventArgs.fig, 'white', eventArgs.step)
            ), 
          black: null };
        
        this.steps.push(item);
      }
      else {
        // last notation
        const item = this.steps[this.steps.length - 1];
        item.black = new StepDetail(
          eventArgs.step,
          eventArgs.additionalStep ? eventArgs.additionalStep : null,
          eventArgs.fig,
          eventArgs.strike,
          this.isCheckToWhite,
          this.isCheckMateToWhite,
          this.getShowFromX(eventArgs.fig, 'black', eventArgs.step),
          this.getShowFromY(eventArgs.fig, 'black', eventArgs.step)
        );
      }
    }
    else {
      const item = this.steps[this.steps.length - 1];
      if (this.isWhiteNext) {
        // set black
        item.black!.isCheck = this.isCheckToBlack;
        item.black!.isCheckMate = this.isCheckMateToBlack;
      }
      else {
        // set white
        item.white!.isCheck = this.isCheckToWhite;
        item.white!.isCheckMate = this.isCheckMateToWhite;
      }
    }
  }

  private getShowFromX(figure: string, color: string, step: IStep): boolean {
    let _retVal = false;

    if (figure === 'rook') {
      if (step.from?.y === step.to?.y) {
        for (let i = 0; i < 8; i++) {
          if (i !== step.from?.x && i !== step.to?.x) {
            const fig = this.chessBase.getFigure(i, step.from!.y);

            if (fig && fig.name === 'rook' && fig.color === color) {
              _retVal = true;
              break;
            }
          }
        }
      }
    }

    return _retVal;
  }

  private getShowFromY(figure: string, color: string, step: IStep): boolean {
    let _retVal = false;

    if (figure === 'rook') {
      if (step.from?.x === step.to?.x) {
        for (let i = 0; i < 8; i++) {
          if (i !== step.from?.y && i !== step.to?.y) {
            const fig = this.chessBase.getFigure(step.from!.x, i);

            if (fig && fig.name === 'rook' && fig.color === color) {
              _retVal = true;
              break;
            }
          }
        }
      }
    }

    return _retVal;
  }

  private onSyncronize(board: ICell[], steps: IStepNotation[], colorOfNext: string, isWhiteResigned: boolean, isBlackResigned: boolean): void {
    this.syncronizeBoard(board);
    this.syncronizeSteps(steps);
    this.isWhiteNext = (colorOfNext === 'white');

    if (isWhiteResigned || isBlackResigned) {
      const color = (isWhiteResigned)? 'white': 'black';
      this.onResignClick(color);
    }
    else {
      this.chessBase.processCombinatedTests(this.colorOfNext);
      this.msg = this.colorOfNext.toUpperCaseFirstLetter() + ' is next.';
    }
  }

  private onPromotion(): void {
    this.onStep(null);
  }

  private onCheckMate(): void {
    this.msg = 'Checkmate. ' + this.colorOfWinner.toUpperCaseFirstLetter() + ' won!';
  }

  private onResign(): void {
    const resignedColor = (this.isWhiteResigned) ? 'white' : 'black';

    this.msg = resignedColor.toUpperCaseFirstLetter() + ' resigned. ' + this.colorOfWinner.toUpperCaseFirstLetter() + ' won!';
  }

  private getFigure(x: number, y: number): IFigure | null {
    return this.chessBase.getFigure(x, y);
  }

  private setFrom(x: number, y: number): void {
    const fig = this.getFigure(x, y);

    if (fig && fig.color === this.colorOfNext) {
      if (!this.isStarted) {
        this.isGameStarted = true;
      }
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

  private syncronizeBoard(board: ICell[]): void {
    this.chessBase.board = [];
    for (let i = 0; i < board.length; i++) {
      const element = board[i];
      if (element.figure?.name) {
        ChessFactory.createFigure(element.figure.name, element.figure.color, element.x, element.y);
      }
    }
  }

  private syncronizeSteps(steps: IStepNotation[]): void {
    this.steps = [];
    for (let i = 0; i < steps.length; i++) {
      const element = steps[i];
      const item: IStepNotation = { 
        white: new StepDetail(
          element.white.step,
          element.white.additionalStep,
          element.white.fig,
          element.white.isStrike,
          element.white.isCheck,
          element.white.isCheckMate,
          element.white.isShowFromX,
          element.white.isShowFromY
          ), 
        black: null };

      if (element.black) {
        item.black = new StepDetail(
          element.black.step,
          element.black.additionalStep,
          element.black.fig,
          element.black.isStrike,
          element.black.isCheck,
          element.black.isCheckMate,
          element.black.isShowFromX,
          element.black.isShowFromY
        );
      }
      
      this.steps.push(item);
    }
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

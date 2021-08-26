import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ChessBase } from './chess-base.';
import { ChessFactory } from './chess.factory';
import './chess.helpers';
import { io } from 'socket.io-client';

const SOCKET_ENDPOINT = 'http://angular-chess-api.azurewebsites.net';

@Component({
  selector: 'app-chess',
  templateUrl: './chess.component.html',
  styleUrls: ['./chess.component.less']
})
export class ChessComponent implements OnInit, OnDestroy {

  x: string[] = ['a','b','c','d','e','f','g','h'];
  y: string[] = ['8','7','6','5','4','3','2','1'];
  msg: string = '';
  joinMsg: string = '';
  roomNameForCreate: string = '';
  roomNameForJoin: string = '';
  PINForJoin: string = '';
  socket;

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

  constructor() { 
    this.chessBase = ChessBase.instance;
    
    this.chessBase.events.subscribe('stepFinished', (eventArgs: any) => { this.onStep(eventArgs); });
    this.chessBase.events.subscribe('stepIllegal', () => { this.clearStep(); });
    this.chessBase.events.subscribe('promotionFinished', () => { this.onPromotion(); });
    this.chessBase.events.subscribe('checkmate', () => { this.onCheckMate(); });
    this.chessBase.events.subscribe('resign', () => { this.onResign(); });

    this.fillBoard();

    this.socket = io(SOCKET_ENDPOINT);

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

      // if isStarted -> get board from white, get colorOfNext
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
    
    console.log('onPromotionClick');
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
      console.log('onStep(null)');
      this.step = { from: null, to: null };
      this.isClickedFrom = !this.isClickedFrom;
      this.isWhiteNext = !this.isWhiteNext;
      this.msg = this.colorOfNext.toUpperCaseFirstLetter() + ' is next.';

      // test check, checkmate, dead position, stalemate
      this.chessBase.processCombinatedTests(this.colorOfNext);
    }

    if (eventArgs && this.isMultiPlayer && this.localGamers.includes(eventArgs.color)){
      const roomName: string = (eventArgs.color === 'white') ? this.roomNameForCreate : this.roomNameForJoin;
      this.socket.emit('step', roomName, this.PINForJoin, eventArgs);
    }
  }

  private onPromotion(): void {
    console.log('onPromotion');
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
      console.log(fig?.color, this.colorOfNext);
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

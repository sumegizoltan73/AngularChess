import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { ChessComponent } from './chess/chess.component';
import { LocalStorageService } from './chess/localstorage.service';

@NgModule({
  declarations: [
    AppComponent,
    ChessComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [LocalStorageService],
  bootstrap: [AppComponent]
})
export class AppModule { }

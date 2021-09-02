import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { ChessComponent } from './chess/chess.component';
import { NgxMaskModule, IConfig } from 'ngx-mask'
import { LocalStorageService } from './chess/localstorage.service';

@NgModule({
  declarations: [
    AppComponent,
    ChessComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgxMaskModule.forRoot()
  ],
  providers: [LocalStorageService],
  bootstrap: [AppComponent]
})
export class AppModule { }

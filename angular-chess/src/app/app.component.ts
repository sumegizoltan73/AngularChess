import { Component, HostListener } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less'],
    standalone: false
})
export class AppComponent {
  title = 'angular-chess';

  @HostListener('window:resize', ['$event'])
  @HostListener('window:load', ['$event'])
  onResize(event: Event) {
    const el = document.querySelector('.board-div');
    const parentrow = el?.parentNode;
    let extra = 0;
    let width = (el?.clientWidth) ? el?.clientWidth : 540;
    console.log((width) ,(<HTMLDivElement> parentrow).clientWidth, window.innerWidth, '   -----  ', window.innerHeight);
    if ((width + 250) < (<HTMLDivElement> parentrow).clientWidth) {
      width = window.innerWidth / 2;
      extra = 40;
    }
    const height = window.innerHeight;
    const maxValue = (width < (height - 120)) ? width : height - 210;
    const normalValue = 470 + extra;
    console.log(maxValue, extra, normalValue);
    const percentage = parseInt((maxValue / normalValue * 100).toString(), 10);

    console.log(percentage);
    (<HTMLHtmlElement> document.children[0]).style.fontSize = percentage + '%';
  }
}

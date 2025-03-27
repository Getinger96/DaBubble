import { Component } from '@angular/core';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { ActiveUserComponent } from './active-user/active-user.component';
import { WebspaceMenuComponent } from './webspace-menu/webspace-menu.component';
import { MainChatComponent } from './main-chat/main-chat.component';
import { ThreadComponent } from './thread/thread.component';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [SearchBarComponent, ActiveUserComponent, WebspaceMenuComponent, MainChatComponent, ThreadComponent],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss'
})
export class MainContentComponent {

}

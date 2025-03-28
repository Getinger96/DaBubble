import { Component } from '@angular/core';
import { SearchBarComponent } from '../main-components/search-bar/search-bar.component';
import { ActiveUserComponent } from '../shared-components/active-user/active-user.component';
import { WebspaceMenuComponent } from '../main-components/webspace-menu/webspace-menu.component';
import { MainChatComponent } from '../main-components/main-chat/main-chat.component';
import { ThreadComponent } from '../main-components/thread/thread.component';
import { HeaderComponent } from '../shared-components/header/header.component';

@Component({
  selector: 'app-main-components',
  standalone: true,
  imports: [SearchBarComponent, ActiveUserComponent, WebspaceMenuComponent, MainChatComponent, ThreadComponent, HeaderComponent],
  templateUrl: './main-components.component.html',
  styleUrl: './main-components.component.scss'
})
export class MainComponentsComponent {

}

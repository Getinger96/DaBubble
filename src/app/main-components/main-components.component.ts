import { Component } from '@angular/core';
import { SearchBarComponent } from '../main-components/search-bar/search-bar.component';
import { ActiveUserComponent } from '../shared-components/active-user/active-user.component';
import { WorkspaceMenuComponent } from './workspace-menu/workspace-menu.component';
import { MainChatComponent } from '../main-components/main-chat/main-chat.component';
import { ThreadComponent } from '../main-components/thread/thread.component';
import { HeaderComponent } from '../shared-components/header/header.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-main-components',
  standalone: true,
  imports: [SearchBarComponent, ActiveUserComponent, WorkspaceMenuComponent , MainChatComponent, ThreadComponent, HeaderComponent, NgIf],
  templateUrl: './main-components.component.html',
  styleUrl: './main-components.component.scss'
})
export class MainComponentsComponent {

  openWorkspace:boolean = true;

}

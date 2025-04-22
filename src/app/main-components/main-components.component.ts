import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { SearchBarComponent } from '../main-components/search-bar/search-bar.component';
import { ActiveUserComponent } from '../shared-components/active-user/active-user.component';
import { WorkspaceMenuComponent } from './workspace-menu/workspace-menu.component';
import { MainChatComponent } from '../main-components/main-chat/main-chat.component';
import { ThreadComponent } from '../main-components/thread/thread.component';
import { HeaderComponent } from '../shared-components/header/header.component';
import { ToggleWebspaceMenuComponent } from './toggle-webspace-menu/toggle-webspace-menu.component';
import { NgIf, CommonModule } from '@angular/common';
import { LoadingService } from '../services/loading.service';
import { Subscription } from 'rxjs';
import { RegisterService } from '../firebase-services/register.service';
import { User } from '../interfaces/user.interface';
import { MessageService } from '../firebase-services/message.service';
import { MainComponentService } from '../firebase-services/main-component.service';
import { UserCardMenuComponent } from "./user-card-menu/user-card-menu.component";


@Component({
  selector: 'app-main-components',
  standalone: true,
  imports: [SearchBarComponent, ActiveUserComponent, WorkspaceMenuComponent, MainChatComponent, ThreadComponent, HeaderComponent, ToggleWebspaceMenuComponent, NgIf, CommonModule, UserCardMenuComponent],
  templateUrl: './main-components.component.html',
  styleUrl: './main-components.component.scss'
})  
export class MainComponentsComponent implements OnInit {
  loadingStatus: boolean = false;
  allUsers: User[] = [];
  private loadingSubscription!: Subscription;
  private usersSubscription!: Subscription;

  constructor(private loadingService: LoadingService, private registerservice: RegisterService,private mainservice:MainComponentService  ) {}

  ngOnInit(): void {
    this.usersSubscription = this.mainservice.allUsers$.subscribe(users => {
      if (users.length > 0) {
        this.allUsers = users.filter(user => user.email !== 'guest@gmail.com');
        this.loadingStatus = this.loadingService.setLoading(true);
        console.log('Benutzer in der Komponente:', this.allUsers);
        console.log('laden:', this.loadingStatus);
      }
    });
  }

  static toggleThreads():void {
    const threads = document.querySelector('app-thread');
    if (threads) {
      threads.classList.toggle('closed');
    }
  }

  static toggleWorkspace():void {
    const workspace = document.querySelector('app-workspace-menu');
    if (workspace) {
      workspace.classList.toggle('closed');
    }
  }

 



  }

 
  


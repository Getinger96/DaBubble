import { Component, OnInit, OnDestroy } from '@angular/core';
import { SearchBarComponent } from '../main-components/search-bar/search-bar.component';
import { ActiveUserComponent } from './active-user/active-user.component';
import { WorkspaceMenuComponent } from './workspace-menu/workspace-menu.component';
import { ChannelChatComponent } from './channel-chat/channel-chat.component';
import { MainChatComponent } from '../main-components/main-chat/main-chat.component';
import { ThreadComponent } from '../main-components/thread/thread.component';
import { HeaderComponent } from '../shared-components/header/header.component';
import { ToggleWebspaceMenuComponent } from './toggle-webspace-menu/toggle-webspace-menu.component';
import { NgIf, CommonModule } from '@angular/common';
import { LoadingService } from '../services/loading.service';
import { MainHelperService } from '../services/main-helper.service';
import { Subscription } from 'rxjs';
import { RegisterService } from '../firebase-services/register.service';
import { User } from '../interfaces/user.interface';
import { MessageService } from '../firebase-services/message.service';
import { Message } from '../interfaces/message.interface';
import { MainComponentService } from '../firebase-services/main-component.service';
import { Router, NavigationStart } from '@angular/router';

@Component({
  selector: 'app-main-components',
  standalone: true,
  imports: [SearchBarComponent, ActiveUserComponent, WorkspaceMenuComponent, MainChatComponent, ThreadComponent, HeaderComponent, ToggleWebspaceMenuComponent, NgIf, CommonModule, ChannelChatComponent],
  templateUrl: './main-components.component.html',
  styleUrl: './main-components.component.scss'
})  

export class MainComponentsComponent implements OnInit, OnDestroy {
  loadingStatus: boolean = false;
  allUsers: User[] = [];
  private loadingSubscription!: Subscription;
  private usersSubscription!: Subscription;
  private chanelSubscription!: Subscription;
  private routerSubscription!: Subscription;
  overlayUserCardActive:boolean = false;
  showChanelSection: boolean = false
  constructor(private loadingService: LoadingService, private registerservice: RegisterService, private mainservice:MainComponentService, private mainhelperService: MainHelperService, private router: Router) {
  }
  selectedThreadMessage: Message | null = null;
  showThreadWindow = false;


  ngOnInit(): void { // lädt alle user !!!
    this.mainservice.allUsers$.subscribe(users => {
      if (users.length > 0) {
        this.allUsers = users.filter(user => user.email !== 'guest@gmail.com');
        this.loadingStatus = this.loadingService.setLoading(true);
        console.log('Benutzer in der Komponente:', this.allUsers);
        console.log('laden:', this.loadingStatus);
      }
    });
      this.initchanelSubscription();
      this.initRouterSubscription();
  }


  openThreadForMessage(message: Message):void {
    this.selectedThreadMessage = message;
    this.showThreadWindow = true;
    MainComponentsComponent.toggleThreads();
  }

  closeThreadView(): void {
    this.showThreadWindow = false;
    this.selectedThreadMessage = null;
    MainComponentsComponent.toggleThreads();
  }

  static toggleThreads():void {
    const threads = document.querySelector('app-thread');
    if (threads) {
      threads.classList.toggle('closed');
    }
  }


  initchanelSubscription() {
    this.chanelSubscription = this.mainhelperService.openChannel$.subscribe(open=> {
      if (open) {
        this.showChanelSection = open
      }
    })
  }


  initRouterSubscription() {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.mainhelperService.openChannelSection(false);
      }
    });
  }


  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  static toggleWorkspace():void {
    const workspace = document.querySelector('app-workspace-menu');
    if (workspace) {
      workspace.classList.toggle('closed');
    }
  }

}

 
  


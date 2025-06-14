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
import { Router, NavigationStart,RouterModule } from '@angular/router';
import { DirectMessageChatComponent } from "./direct-message-chat/direct-message-chat.component";
import { ChannelMessageService } from '../firebase-services/channel-message.service';
import { ConversationMessage } from '../interfaces/conversation-message.interface';
import { ConversationService } from '../firebase-services/conversation.service';
import { ResponsivService } from '../services/responsiv.service';

@Component({
  selector: 'app-main-components',
  standalone: true,
  imports: [SearchBarComponent, ActiveUserComponent, RouterModule, WorkspaceMenuComponent, ThreadComponent, HeaderComponent, ToggleWebspaceMenuComponent, NgIf, CommonModule, DirectMessageChatComponent],
  templateUrl: './main-components.component.html',
  styleUrl: './main-components.component.scss'
})

export class MainComponentsComponent implements OnInit, OnDestroy {
  loadingStatus: boolean = false;
  allUsers: User[] = [];
  private loadingSubscription!: Subscription;
  private usersSubscription!: Subscription;
  private chanelSubscription!: Subscription;
  private actualUserSubscription!: Subscription;
  private routerSubscription!: Subscription;
  overlayUserCardActive: boolean = false;
  showChanelSection: boolean = false
  showThreadWindow: boolean = false;
  showdirectmessage: boolean = false;
  actualUser: User[] = [];
  private mediaQuery = window.matchMedia('(max-width: 768px)');
  constructor(public messageService: MessageService, private loadingService: LoadingService, private registerservice: RegisterService, public mainservice: MainComponentService, private mainhelperService: MainHelperService, private router: Router, private channemessageService: ChannelMessageService, private conversationMessage: ConversationService, public responsivService: ResponsivService) {
    this.handleMediaChange(this.mediaQuery);
    this.mediaQuery.addEventListener('change', this.handleMediaChange.bind(this));
  }
  selectedThreadMessage: Message | null = null;
  selectedConvThreadMessage: ConversationMessage | null = null;
  


  ngOnInit(): void { // lädt alle user !!!
    this.mainservice.allUsers$.subscribe(users => {
      if (users.length > 0) {
        this.allUsers = users.filter(user => user.email !== 'guest@gmail.com');
        this.loadingStatus = this.loadingService.setLoading(true);
        console.log('Benutzer in der Komponente:', this.allUsers);
        console.log('laden:', this.loadingStatus);
      }
    });
    //lädt der aktuell clicked Message
    if (this.mainservice.showdirectmessage) {
      this.conversationMessage.selectedThreadMessage$.subscribe((message) => {
        this.selectedConvThreadMessage = message;
      })
    } else {
      this.channemessageService.selectedThreadMessage$.subscribe((message) => {
        this.selectedThreadMessage = message;
      });
    }
    this.initchanelSubscription();
    this.initRouterSubscription();
    this.loadActualUser();
  }

  openThreadForConversationMessage(message: ConversationMessage): void {
        console.log('Event empfangen:', message);
    this.selectedConvThreadMessage = message;
    this.mainservice.showThreadWindow = true;
    MainComponentsComponent.toggleThreads();
    this.conversationMessage.openThread(message);
  }

  openThreadForMessage(message: Message): void {
    console.log('Event empfangen:', message);
   this.mainservice.showThreadWindow
    MainComponentsComponent.toggleThreads();
    this.selectedThreadMessage = message;
    this.channemessageService.openThread(message);
  }

  public closeThreadView(): void {
    MainComponentsComponent.toggleThreads();
    this.mainservice.showThreadWindow = false
    this.selectedThreadMessage = null;
    this.selectedConvThreadMessage = null;
  }

  static toggleThreads(): void {
    const threads = document.querySelector('app-thread');
    if (threads) {
      threads.classList.toggle('closed');
      
    }
  }

  initchanelSubscription() {
    this.chanelSubscription = this.mainhelperService.openChannel$.subscribe(open => {
      if (open) {
        this.showChanelSection = open
      }
      else {
        this.showChanelSection = false;
      }
    })
  }


  loadActualUser() {
    this.actualUserSubscription = this.mainservice.acutalUser$.subscribe(actualUser => {
      if (actualUser.length > 0) {
        this.actualUser = actualUser;
        console.log('aktueller User:', this.actualUser);
      }
    });
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

  static toggleWorkspace(): void {
    const workspace = document.querySelector('app-workspace-menu');
    if (workspace) {
      workspace.classList.toggle('closed');
    }
  }

openWorkspaceMobile() {
  const workspace = document.querySelector('app-workspace-menu');
  const routerWrapper = document.getElementById('routerOutletWrapper');
  const directMessage = document.getElementById('directMessageChat');
  const workspaceIsNowClosed = workspace?.classList.toggle('closed');
  this.responsivService.workspace = true;

  if (workspaceIsNowClosed) {
    routerWrapper!.classList.remove('hidden');
    directMessage?.classList.remove('hidden');
  } else {
    routerWrapper?.classList.add('hidden');
    directMessage?.classList.add('hidden');
  }
}


  handleMediaChange(e: MediaQueryListEvent | MediaQueryList) {
    const workspace = document.querySelector('app-workspace-menu');
    if (e.matches) {
      if (workspace) {
        workspace.classList.toggle('closed');
        this.responsivService.workspace = false;
      }
    }

  }

  closeDirectChatAndChannelchat() {
    this.mainhelperService.openChannel = false;
    this.mainservice.showdirectmessage = false
  }

}
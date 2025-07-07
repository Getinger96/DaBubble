import { Component, OnInit, OnDestroy, HostListener, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
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
import { Router, NavigationStart, RouterModule } from '@angular/router';
import { DirectMessageChatComponent } from "./direct-message-chat/direct-message-chat.component";
import { ChannelMessageService } from '../firebase-services/channel-message.service';
import { ConversationMessage } from '../interfaces/conversation-message.interface';
import { ConversationService } from '../firebase-services/conversation.service';
import { ResponsivService } from '../services/responsiv.service';
import { NewChatComponent } from "./new-chat/new-chat.component";

@Component({
  selector: 'app-main-components',
  standalone: true,
  imports: [SearchBarComponent, ActiveUserComponent, RouterModule, WorkspaceMenuComponent, ThreadComponent, HeaderComponent, ToggleWebspaceMenuComponent, NgIf, CommonModule, DirectMessageChatComponent, MainChatComponent, NewChatComponent],
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
  @ViewChild('routerWrapper') routerWrapperRef?: ElementRef;
  @ViewChild('directMessage') directMessageRef?: ElementRef;
  overlayUserCardActive: boolean = false;
  showChanelSection: boolean = false
  showThreadWindow: boolean = false;
  showdirectmessage: boolean = false;
  openNewChat: boolean = false
  actualUser: User[] = [];
  workspaceIsOpen: boolean = false
  isWorkspaceOpen = false;
  selectedThreadMessage: Message | null = null;
  selectedConvThreadMessage: ConversationMessage | null = null;
  @ViewChild('threadRef') threadRef?: ElementRef;
  private mediaQuery = window.matchMedia('(max-width: 900px)');
  constructor(public messageService: MessageService, private loadingService: LoadingService, private registerservice: RegisterService, public mainservice: MainComponentService, public mainhelperService: MainHelperService, private router: Router, private channemessageService: ChannelMessageService, private conversationMessage: ConversationService, public responsivService: ResponsivService) {

  }
  



  ngOnInit(): void { // lädt alle user !!!
    this.checkWidth();
    this.mainservice.allUsers$.subscribe(users => {
      if (users.length > 0) {
        this.allUsers = users.filter(user => user.email !== 'guest@gmail.com');
        this.loadingStatus = this.loadingService.setLoading(true);
        console.log('Benutzer in der Komponente:', this.allUsers);
        console.log('laden:', this.loadingStatus);
      }
    });
    //lädt der aktuell clicked Message
    this.conversationMessage.selectedThreadMessage$.subscribe((message) => {
      this.selectedConvThreadMessage = message;
      console.log('[DirectMessage] Thread wurde gesetzt:', message);
    });
    this.channemessageService.selectedThreadMessage$.subscribe((message) => {
      this.selectedThreadMessage = message;
      console.log('[Channel] Thread wurde gesetzt:', message);
    });
    this.initchanelSubscription();
    this.initRouterSubscription();
    this.loadActualUser();

  }



  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkWidth()
  }


 

  get shouldHideRouter() {
    const workspace = document.querySelector('app-workspace-menu');
    if (window.matchMedia('(max-width: 900px)').matches && !workspace!.classList.contains('closed') && !this.mainhelperService.ToDirectChat) {
      workspace!.classList.remove('closed');
      return true
    } else if (this.mainhelperService.ToDirectChat) {
      workspace!.classList.add('closed');
       return false
    } {
      return false
    }

  }

  openThreadForConversationMessage(message: ConversationMessage): void {
        console.log('Event empfangen:', message);
    this.selectedConvThreadMessage = message;
    this.mainservice.showThreadWindow = true;
    MainComponentsComponent.toggleThreads();
    this.conversationMessage.openThread(message);
  }

  checkWidhtDirectMessage() {
    
  }

  openThreadForMessage(message: Message): void {
    console.log('Event empfangen:', message);
   this.mainservice.showThreadWindow
    MainComponentsComponent.toggleThreads();
    this.selectedThreadMessage = message;
    this.channemessageService.openThread(message);
       this.openChannelAndDirectMessage()
  }

  public closeThreadView(): void {
    MainComponentsComponent.toggleThreads();
    this.mainservice.showThreadWindow = false
    this.selectedThreadMessage = null;
    this.selectedConvThreadMessage = null;
    this.openChannelAndDirectMessage()
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


  openChannelAndDirectMessage() {
    const routerWrapper = document.getElementById('routerOutletWrapper');
    const directMessage = document.getElementById('directMessageChat');


    if (routerWrapper) {
      routerWrapper!.classList.remove('hidden');
    }

    if (directMessage) {
      directMessage!.classList.remove('hidden');
    }
  }


  checkWidthWorkspace() {
    if (!this.mainservice.showdirectmessage) {
      const main = document.querySelector('main');
      if (window.matchMedia('(max-width: 900px)').matches) {
        main!.classList.add('hidden');
      }
    }

    if (this.mainservice.showdirectmessage) {
      const directMessage = document.querySelector('app-direct-message-chat')
      if (window.matchMedia('(max-width: 900px)').matches) {
        directMessage!.classList.add('hidden');
      }
    }

  }

  closeThreadViewAfterWorkspaceIsOpen() {
    this.showThreadWindow = false;
    this.mainservice.showThreadWindow = false
    this.selectedThreadMessage = null;
    this.selectedConvThreadMessage = null;
  }


openWorkspaceMobile() {
    this.isWorkspaceOpen = !this.isWorkspaceOpen;
  setTimeout(() => {
    const workspace = document.querySelector('app-workspace-menu');
    const isClosed = workspace?.classList.toggle('closed');
    this.responsivService.workspace = true;
    this.toggleVisibleSections(isClosed);
  }, 0);
}

private toggleVisibleSections(isClosed: boolean | undefined) {
  const showNewChat = this.mainhelperService.openNewChat;
  const showDirectMessage = this.mainservice.showdirectmessage;
  const newChat = document.getElementById('newChat');
  const directMessage = document.getElementById('directMessageChat');
  const routerWrapper = document.getElementById('routerOutletWrapper');
  if (isClosed) {

    newChat?.classList.toggle('hidden', !showNewChat);
    directMessage?.classList.toggle('hidden', !showDirectMessage || showNewChat);
    routerWrapper?.classList.toggle('hidden', showDirectMessage || showNewChat);
    if (!showNewChat && !showDirectMessage) {
      routerWrapper?.classList.remove('hidden');
    }
    if (!showNewChat) {
      this.mainhelperService.openNewChat = false;
    }
  } else {
    [newChat, directMessage, routerWrapper].forEach(el => el?.classList.add('hidden'));
    this.closeThreadViewAfterWorkspaceIsOpen();
  }
}


  checkWidth() {
    const width = window.innerWidth;
    const threadsHtml = document.getElementById('threads');
    if (width <= 1400) {
      this.checkThreadIsOpenOrChannelChat()
      this.checkThreadIsDirectChat()
    } else {
      this.removeThreadsIsOpenChannel()
      this.removeThreadsIsOpenDirectMessage();
    }
    this.checkwidthForThreads()
  }

  checkThreadIsOpenOrChannelChat() {
    const routerWrapper = document.getElementById('routerOutletWrapper');
    const threadsHtml = document.getElementById('threads');
    const newChat = document.getElementById('newChat');
    const workspace = document.querySelector('app-workspace-menu');
    if (routerWrapper && !routerWrapper.classList.contains('hidden') && threadsHtml && !threadsHtml.classList.contains('closed')) {
      routerWrapper?.classList.add('hidden');
      threadsHtml?.classList.add('showThreadSideLarge');

    }
  }


  checkThreadIsDirectChat() {
    const directMessage = document.getElementById('directMessageChat');
    const threadsHtml = document.getElementById('threads');
    const routerWrapper = document.getElementById('routerOutletWrapper');
    const workspace = document.querySelector('app-workspace-menu');
    if (this.mainservice.showThreadWindow && routerWrapper && routerWrapper && !routerWrapper.classList.contains('hidden') || directMessage && !directMessage.classList.contains('hidden') && threadsHtml && !threadsHtml.classList.contains('closed')) {
      directMessage?.classList.add('hidden');
      threadsHtml?.classList.add('showThreadSideLarge');
      routerWrapper?.classList.add('hidden');

    }
  }


checkwidthForThreads() {
  const directMessage = document.getElementById('directMessageChat');
  const threadsHtml = document.getElementById('threads');
  const routerWrapper = document.getElementById('routerOutletWrapper');
  const workspace = document.querySelector('app-workspace-menu');
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  if (isMobile) {
    const threadsVisible = threadsHtml && !threadsHtml.classList.contains('hidden');
    const directMessageHidden = directMessage && directMessage.classList.contains('hidden');
    const routerHidden = routerWrapper && routerWrapper.classList.contains('hidden')

    if (threadsVisible && (directMessageHidden || routerHidden)) {
      workspace?.classList.add('closed');
    }
  }
}

  removeThreadsIsOpenChannel() {
    const routerWrapper = document.getElementById('routerOutletWrapper');
    const threadsHtml = document.getElementById('threads');
    const newChat = document.getElementById('newChat');

    if (newChat && newChat.classList.contains('hidden')) {

    routerWrapper?.classList.remove('hidden');
    threadsHtml?.classList.remove('showThreadSideLarge');


    }
  }


  removeThreadsIsOpenDirectMessage() {
    const directMessage = document.getElementById('directMessageChat');
    const threadsHtml = document.getElementById('threads');
    const newChat = document.getElementById('newChat');

    if (newChat && newChat.classList.contains('hidden')) {
    directMessage?.classList.remove('hidden');
    threadsHtml?.classList.remove('showThreadSideLarge');

    }        
  }


  closeDirectChatAndChannelchat() {
    this.mainhelperService.openChannel = false;
    this.mainservice.showdirectmessage = false
  }

  toggleOpenNewChat(value: boolean) {
    this.mainhelperService.openNewChat = true;

     if (window.matchMedia('(max-width: 900px)').matches) {
       this.openWorkspaceMobile();
      }
  }

}
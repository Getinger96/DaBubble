import { Component, ElementRef, EventEmitter, HostListener, input, Output, ViewChild } from '@angular/core';
import { MainComponentService } from '../../firebase-services/main-component.service';
import { NgIf, CommonModule } from '@angular/common';
import { UserCardService } from '../active-user/services/user-card.service';
import { ConversationService } from '../../firebase-services/conversation.service';
import { ConversationMessage } from '../../interfaces/conversation-message.interface';
import { DirectMessageComponent } from '../../shared-components/direct-message/direct-message.component';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MainHelperService } from '../../services/main-helper.service';
import { ProfileCardComponent } from '../profile-card/profile-card.component';
import { ProfileCardOverlayService } from '../profile-card/profile-card-overlay.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { ThreadComponent } from '../thread/thread.component';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, filter, map, switchMap,firstValueFrom } from 'rxjs';
import { User } from '../../interfaces/user.interface';


@Component({
  selector: 'app-direct-message-chat',
  standalone: true,
  imports: [NgIf, CommonModule, FormsModule, DirectMessageComponent, ProfileCardComponent, PickerComponent],
  templateUrl: './direct-message-chat.component.html',
  styleUrl: './direct-message-chat.component.scss'
})
export class DirectMessageChatComponent {
  @Output() openThread = new EventEmitter<ConversationMessage>();
   private actualUserSubscription!: Subscription;
  @Output() closeThread = new EventEmitter<void>();
  @Output() currentmessageUser: string = '';
  @Output() currentmessageEmail: string = '';
  @Output() currentmessageAvatar: any;
  @Output() currentmessageStatus: string = '';
  @Output() currentUserId: string = '';
  @Output() overlayvisible: boolean = false;
  @ViewChild('chatFeed') private chatFeed!: ElementRef;
  @ViewChild('emojiComponent') emojiComponent!: ElementRef<HTMLTextAreaElement>;
  @ViewChild(ThreadComponent) threadComponent!: ThreadComponent;
  directmessageid!: string;
  actualUser?: string;
  actualUserArray: User[] = [];
  userId: string = '';
  allConversationMessages: ConversationMessage[] = [];
  conversationId: string | null = null;
  newConvMessage: string = '';
  openChannel = this.mainHelperService.openChannel;
  showDirectMessage = this.mainservice.showdirectmessage
  toggleEmoji: boolean = false
  toggleMemberInChat: boolean = false;


  private scrolled = false;

  dateFormatter = new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long'
  });

  timeFormatter = new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  private unsubscribeFromMessages?: () => void;
  private initSub?: Subscription;



  constructor(private mainservice: MainComponentService, public usercardservice: UserCardService, public conversationservice: ConversationService, private mainHelperService: MainHelperService, public profilecardservice: ProfileCardOverlayService, private _eref: ElementRef, private route: ActivatedRoute) {
 this.route.params.subscribe(p => {
    if (p['directmessageid']) {
      this.mainservice.setDirectmessageuserId(p['directmessageid']);
    }
  });
  }

  async ngOnInit(): Promise<void> {
    this.loadRouter();
    this.loadName();
    this.loadAvatar();
    this.loadEmail();
    this.loadStatus();
    this.loadUserId();
    setTimeout(() => this.scrollToBottom(), 0);
    this.actualUser = this.mainservice.actualUser[0]?.name;

        await this.initConversation();
      if (!this.showDirectMessage) {
      this.showDirectMessage = true
    }

     await this.initConversation();

    // Reagiere auf Änderungen des Chat-Partners (z. B. wenn du auf anderen User klickst)
    this.mainservice.directmessaeUserIdSubject.subscribe(async (newPartnerId) => {
      await this.initConversation(); // Lade neue Konversation und Nachrichten
    });
    if (this.showDirectMessage==false) {
      this.showDirectMessage=true
    }
  }


loadRouter(): void {
  // Lese directmessageid aus der aktuellen Route
  this.route.paramMap.subscribe(params => {
    const directmessageid = params.get('directmessageid');
    if (directmessageid) {
      this.directmessageid = directmessageid;
      this.mainservice.setCurrentDirectMessage(this.directmessageid);
      this.currentUserId = this.directmessageid;
      console.log('🎯 Aktive directmessageid:', this.directmessageid);
    }
  });

  this.route.parent?.paramMap.subscribe(params => {
    const userId = params.get('id');
    if (userId) {
      this.userId = userId;
      console.log('🎯 Aktive id aus Parent-Route:', this.userId);
    }
  });
}
  


  onReplyToMessage(message: ConversationMessage) {
    this.openThread.emit(message);
  }



  loadName() {
    this.mainservice.currentusermessageName$.subscribe(name => {
        console.log('[Component] Name empfangen:', name);  // <--- LOG
      this.currentmessageUser = name
    })
  }
  loadEmail() {
    this.mainservice.currentusermessagEmail$.subscribe(email => {
      this.currentmessageEmail = email;
    })
  }
  loadAvatar() {
    this.mainservice.currentusermessagAvatar$.subscribe(avatar => {
      this.currentmessageAvatar = avatar;
    })
  }
  loadStatus() {
    this.mainservice.currentusermessagStatus$.subscribe(status => {
      this.currentmessageStatus = status;
    })
  }

  loadUserId() {
    this.mainservice.currentusermessagId$.subscribe(id => {
      this.currentUserId = id;
    })
  }

  closeOverlay() {
    this.overlayvisible = false;
  }

  onEmojiButtonClick(event: MouseEvent) {
    event.stopPropagation(); // verhindert Auslösung von handleClickOutside
    this.toggleEmojiBar();
  }
  toggleEmojiBar() {
    this.toggleEmoji = !this.toggleEmoji;
    if (this.toggleMemberInChat) {
      this.toggleMemberInChat = false
    }
  }

  addEmoji(event: any) {
    const emoji = event.emoji.native;
    console.log('emoji', emoji);


    this.newConvMessage += emoji;



  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    const clickedInsideEmoji =
      this.emojiComponent?.nativeElement?.contains(target) ||
      (target.closest('.emojiWindow') !== null); // sicherstellen, dass auch Kinderelemente zählen

    if (!clickedInsideEmoji) {
      this.toggleEmoji = false;
    }
  }



  openOverlay() {
    this.overlayvisible = true
  }

  ngAfterViewChecked() {
    if (!this.scrolled) {
      this.scrollToBottom();
    }
  }

  scrollToBottom(): void {
    try {
      this.chatFeed.nativeElement.scrollTop = this.chatFeed.nativeElement.scrollHeight;
      this.scrolled = true;
    } catch (err) { }
  }

  onScroll(): void {
    if (this.chatFeed.nativeElement.scrollTop < this.chatFeed.nativeElement.scrollHeight - this.chatFeed.nativeElement.clientHeight) {
      this.scrolled = true;
    }
  }

  checkConversation(user1: string, user2: string) {
    this.conversationservice.getOrCreateConversation(user1, user2);
  }

 async initConversation(): Promise<void> {
  if (this.unsubscribeFromMessages) {
    this.unsubscribeFromMessages();
    this.unsubscribeFromMessages = undefined;
  }

  let currentUserId = '';

  if (this.mainservice.actualUser[0]?.id) {
    currentUserId = this.mainservice.actualUser[0].id;
  } else {
    currentUserId = this.userId;
  }

  const partnerUserId = this.mainservice.directmessaeUserIdSubject.value;

  if (!currentUserId || !partnerUserId) {
    console.warn('Fehlende User IDs beim Init:', { currentUserId, partnerUserId });
    return;
  }

  this.conversationId = await this.conversationservice.getOrCreateConversation(currentUserId, partnerUserId);
  console.log('Lade Konversation mit ID:', this.conversationId);

  this.unsubscribeFromMessages = this.conversationservice.listenToMessages(this.conversationId, (liveMessages) => {
    this.allConversationMessages = liveMessages;
    this.scrollToBottom();
  });
}


  async addConversationMessage() {
    const currentUserId = this.mainservice.actualUser[0].id;
    const currentUserName = this.mainservice.actualUser[0].name;
    const currentUserAvatar = this.mainservice.actualUser[0].avatar;

    if (this.conversationId && this.newConvMessage.trim() !== '') {
      await this.conversationservice.sendMessage(this.conversationId, currentUserId, this.newConvMessage, currentUserName, currentUserAvatar);
      this.newConvMessage = '';
    } else {
      console.log('Fehlende Daten:', this.conversationId, this.newConvMessage);
    }
  }

  ngOnDestroy(): void {
    this.initSub?.unsubscribe();
    if (this.unsubscribeFromMessages) {
      this.unsubscribeFromMessages();
    }
  }


  loadConversationMessageSender(message: ConversationMessage) {
    if (message.isOwn) {
      return this.actualUser;
    } else {
      return this.currentmessageUser;
    }
  }

  loadConversationMessageSenderAvatar(message: ConversationMessage) {
    if (message.isOwn) {
      return this.mainservice.actualUser[0].avatar;
    } else {
      return this.currentmessageAvatar;
    }
  }

}

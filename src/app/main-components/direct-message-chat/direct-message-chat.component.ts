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
import { combineLatest, filter, map, switchMap, firstValueFrom } from 'rxjs';
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

  constructor(public mainservice: MainComponentService, public usercardservice: UserCardService, public conversationservice: ConversationService, private mainHelperService: MainHelperService, public profilecardservice: ProfileCardOverlayService, private _eref: ElementRef, private route: ActivatedRoute) {
    this.route.params.subscribe(p => {
      if (p['directmessageid']) {
        this.mainservice.setDirectmessageuserId(p['directmessageid']);
      }
    });
  }

    /**
   * Angular lifecycle hook that runs on component initialization.
   * Loads user info, sets up conversation, and subscribes to partner changes.
   */
  async ngOnInit(): Promise<void> {
    this.mainservice.showmainchat=false
    this.loadRouter();
    this.loadName();
    this.loadAvatar();
    this.loadEmail();
    this.loadStatus();
    this.loadUserId();
    setTimeout(() => this.scrollToBottom(), 0);
    this.actualUser = this.mainservice.actualUser[0]?.name;

    await this.initConversation();
    if (!this.mainservice.showdirectmessage) {
      this.mainservice.showdirectmessage = true
    }

    await this.initConversation();

    // Reagiere auf Änderungen des Chat-Partners (z. B. wenn du auf anderen User klickst)
    this.mainservice.directmessaeUserIdSubject.subscribe(async (newPartnerId) => {
      await this.initConversation(); // Lade neue Konversation und Nachrichten
    });
  }

    /**
   * Loads directmessageid and userId from the current route and parent route.
   */
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

    /**
   * Emits the openThread event when a reply to a message is requested.
   * @param message The conversation message to reply to.
   */
  onReplyToMessage(message: ConversationMessage) {
    this.openThread.emit(message);
  }

  /**
   * Subscribes to the current user's name observable and updates the local property.
   */
  loadName() {
    this.mainservice.currentusermessageName$.subscribe(name => {
      console.log('[Component] Name empfangen:', name);  // <--- LOG
      this.currentmessageUser = name
    })
  }

  /**
   * Subscribes to the current user's email observable and updates the local property.
   */
  loadEmail() {
    this.mainservice.currentusermessagEmail$.subscribe(email => {
      this.currentmessageEmail = email;
    })
  }

  /**
   * Subscribes to the current user's avatar observable and updates the local property.
   */
  loadAvatar() {
    this.mainservice.currentusermessagAvatar$.subscribe(avatar => {
      this.currentmessageAvatar = avatar;
    })
  }

  /**
   * Subscribes to the current user's status observable and updates the local property.
   */
  loadStatus() {
    this.mainservice.currentusermessagStatus$.subscribe(status => {
      this.currentmessageStatus = status;
    })
  }

  /**
   * Subscribes to the current user's ID observable and updates the local property.
   */
  loadUserId() {
    this.mainservice.currentusermessagId$.subscribe(id => {
      this.currentUserId = id;
    })
  }

  /**
   * Closes the profile card overlay.
   */
  closeOverlay() {
    this.overlayvisible = false;
  }

    /**
   * Handles the emoji button click event and toggles the emoji bar.
   * @param event The mouse event.
   */
  onEmojiButtonClick(event: MouseEvent) {
    event.stopPropagation(); // verhindert Auslösung von handleClickOutside
    this.toggleEmojiBar();
  }

   /**
   * Toggles the visibility of the emoji picker bar.
   */
  toggleEmojiBar() {
    this.toggleEmoji = !this.toggleEmoji;
    if (this.toggleMemberInChat) {
      this.toggleMemberInChat = false
    }
  }

    /**
   * Adds an emoji to the new conversation message input.
   * @param event The emoji event.
   */
  addEmoji(event: any) {
    const emoji = event.emoji.native;
    console.log('emoji', emoji);
    this.newConvMessage += emoji;
  }

    /**
   * Handles clicks outside the emoji picker and closes it if necessary.
   * @param event The mouse event.
   */
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

  /**
   * Opens the profile card overlay.
   */
  openOverlay() {
    this.overlayvisible = true
  }

    /**
   * Angular lifecycle hook that runs after the component's view has been checked.
   * Scrolls to the bottom of the chat if not already scrolled.
   */
  ngAfterViewChecked() {
    if (!this.scrolled) {
      this.scrollToBottom();
    }
  }

   /**
   * Scrolls the chat feed to the bottom.
   */
  scrollToBottom(): void {
    try {
      this.chatFeed.nativeElement.scrollTop = this.chatFeed.nativeElement.scrollHeight;
      this.scrolled = true;
    } catch (err) { }
  }

    /**
   * Handles the scroll event in the chat feed and updates the scrolled state.
   */
  onScroll(): void {
    if (this.chatFeed.nativeElement.scrollTop < this.chatFeed.nativeElement.scrollHeight - this.chatFeed.nativeElement.clientHeight) {
      this.scrolled = true;
    }
  }

    /**
   * Checks if a conversation exists between two users or creates one if not.
   * @param user1 The first user's ID.
   * @param user2 The second user's ID.
   */
  checkConversation(user1: string, user2: string) {
    this.conversationservice.getOrCreateConversation(user1, user2);
  }

    /**
   * Initializes the conversation for the current user and partner.
   * Sets up real-time message listening.
   */
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

    /**
   * Adds a new message to the current conversation.
   */
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

    /**
   * Angular lifecycle hook that runs when the component is destroyed.
   * Unsubscribes from all subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.initSub?.unsubscribe();
    if (this.unsubscribeFromMessages) {
      this.unsubscribeFromMessages();
    }
  }

    /**
   * Returns the sender's name for a given message.
   * @param message The conversation message.
   * @returns The sender's name.
   */
  loadConversationMessageSender(message: ConversationMessage) {
    if (message.isOwn) {
      return this.actualUser;
    } else {
      return this.currentmessageUser;
    }
  }

    /**
   * Returns the sender's avatar for a given message.
   * @param message The conversation message.
   * @returns The sender's avatar.
   */
  loadConversationMessageSenderAvatar(message: ConversationMessage) {
    if (message.isOwn) {
      return this.mainservice.actualUser[0].avatar;
    } else {
      return this.currentmessageAvatar;
    }
  }

    /**
   * Checks if two timestamps are on the same date.
   * @param timestamp1 The first timestamp.
   * @param timestamp2 The second timestamp.
   * @returns True if both timestamps are on the same date, false otherwise.
   */
  public isSameDate(timestamp1: any, timestamp2: any): boolean {
    const date1 = this.convertToDate(timestamp1);
    const date2 = this.convertToDate(timestamp2);
    return date1.toDateString() === date2.toDateString();
  }

    /**
   * Converts a timestamp to a Date object.
   * @param timestamp The timestamp to convert.
   * @returns The Date object.
   */
  private convertToDate(timestamp: any): Date {
    if (timestamp instanceof Date) {
      return timestamp;
    } else if (timestamp && typeof (timestamp as any).toDate === 'function') {
      return (timestamp as any).toDate();
    } else {
      return new Date(timestamp);
    }
  }

}
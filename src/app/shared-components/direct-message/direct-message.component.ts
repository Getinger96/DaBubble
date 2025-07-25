import { Component, ElementRef, EventEmitter, HostListener, Input, NgModule, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MessageComponent } from '../message/message.component';
import { MessageService } from '../../firebase-services/message.service';
import { ConversationMessage } from '../../interfaces/conversation-message.interface';
import { CommonModule } from '@angular/common';
import { MainComponentService } from '../../firebase-services/main-component.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { map, Observable, of, Subscription } from 'rxjs';
import { ConversationService } from '../../firebase-services/conversation.service';
import { FormsModule } from '@angular/forms';
import { ThreadComponent } from '../../main-components/thread/thread.component';
import { deleteDoc, doc, updateDoc } from '@angular/fire/firestore';
import { Message } from '../../interfaces/message.interface';
import { ResponsivService } from '../../services/responsiv.service';
import { MainHelperService } from '../../services/main-helper.service';
@Component({
  selector: 'app-direct-message',
  standalone: true,
  imports: [CommonModule, PickerComponent, FormsModule],
  templateUrl: './direct-message.component.html',
  styleUrls: ['../message/message.component.scss', './direct-message.component.scss'],
})
export class DirectMessageComponent {
  @Output() replyClicked = new EventEmitter<ConversationMessage>();
  @Output() closeThreadRequested = new EventEmitter<void>();

  @Input() messageData: ConversationMessage | undefined;
  @Input() date!: Date | string;
  @Input() avatarSrc!: number;
  @Input() name!: string;
  @Input() time!: Date | string;
  @Input() messageText!: string;
  @Input() isOwn: boolean | undefined = false;
  @Input() dateExists: boolean | undefined = false;
  @Input() isThread: boolean | undefined = false;
  @Input() isInThread: boolean | undefined = false;
  @Input() isAnswered: boolean | undefined = false;
  @Input() lastAnswerDate!: string;
  @Input() selectedMessage: ConversationMessage | null = null;


  @Input() emojiReactionsThead?: { [emoji: string]: { count: number; users: string[] } };
  @ViewChild('emojiComponent') emojiComponent!: ElementRef<HTMLTextAreaElement>
  @ViewChild('emojiImg') emojiImg!: ElementRef<HTMLTextAreaElement>
  @ViewChild('emojiImgWriter') emojiImgWriter!: ElementRef<HTMLTextAreaElement>
  @ViewChild('directInput') directInput!: ElementRef<HTMLTextAreaElement>

  threadCount$: Observable<number> = of(0);
  lastAnswer$: Observable<string> = of('');
  showEmojiPicker: boolean = false;
  showAllEmojis: boolean = false;
  conversationmessageid: string = '';
  editedMessageText: string = '';
  conversationId: string = '';
  editMessage: boolean = false;
  showEditPopup: boolean = false;
  emojiReactions = new Map<string, { count: number, users: string[] }>();
  allMessages: ConversationMessage[] = [];
  threadAnswers: ConversationMessage[] = [];
  emojiReactionsselect = new Map<string, { count: number, users: string[] }>();
  private allThreadsSubscription!: Subscription;

  dateFormatter = new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });


  timeFormatter = new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  constructor(
    private messageservice: MessageService,
    private maincomponentservice: MainComponentService,
    private conversationservice: ConversationService,
    public responsiveService: ResponsivService,
    private mainHelperService: MainHelperService

  ) { }

  /**
   * Angular lifecycle hook that runs on component initialization.
   * Initializes message data, loads reactions, sets up user info, and loads thread answers.
   */
  ngOnInit(): void {
    if (this.messageData) {
      const timestamp = this.messageData.timestamp;
      this.conversationmessageid = this.messageData.conversationmessageId;
      this.conversationId = this.messageData.id;
      this.conversationservice.getReactionsForMessage(
        this.conversationId,                    // ✅ richtig: conversationId
        this.conversationmessageid,            // ✅ richtig: conversationmessageId
        (reactionMap) => {
          this.emojiReactions = reactionMap;
        }
      );



      let dateObj: Date | null = null;
      const rawTimestamp = this.messageData?.timestamp;

      if (rawTimestamp instanceof Date) {
        dateObj = rawTimestamp;
      } else if (typeof (rawTimestamp as any)?.toDate === 'function') {
        dateObj = (rawTimestamp as any).toDate();
      } else if (typeof rawTimestamp === 'number') {
        dateObj = new Date(rawTimestamp);
      } else if (typeof rawTimestamp === 'string') {
        const parsed = new Date(rawTimestamp);
        if (!isNaN(parsed.getTime())) {
          dateObj = parsed;
        }
      } else if (rawTimestamp && typeof rawTimestamp === 'object' && 'seconds' in rawTimestamp) {
        dateObj = new Date((rawTimestamp as any).seconds * 1000);
      }

      if (dateObj && !isNaN(dateObj.getTime())) {
        try {
          this.date = this.dateFormatter.format(dateObj);
          this.time = this.timeFormatter.format(dateObj);
        } catch (e) {
          console.warn('Date formatting failed:', e);
          this.date = '';
          this.time = '';
        }
      } else {
        this.date = '';
        this.time = '';
        console.warn('Invalid timestamp for message:', rawTimestamp);
      }
      Wichtig:

      this.maincomponentservice.currentusermessagAvatar$.subscribe((avatar) => {
        if (
          this.messageData?.senderId ===
          this.maincomponentservice.directmessaeUserIdSubject.value
        ) {
          this.avatarSrc = avatar || this.avatarSrc;
        } else {
          this.avatarSrc = this.maincomponentservice.actualUser[0].avatar;
        }
      });
      this.maincomponentservice.currentusermessageName$.subscribe((name) => {
        if (
          this.messageData?.senderId ===
          this.maincomponentservice.directmessaeUserIdSubject.value
        ) {
          this.name = name || this.name;
        } else {
          this.name = this.maincomponentservice.actualUser[0].name;
        }
      });

      const lastAnswer = this.conversationservice.getLastAnswer(
        this.messageData
      );
      if (lastAnswer && lastAnswer.timestamp) {
        const lastAnswerMillis = this.normalizeTimestamp(lastAnswer.timestamp);
        if (lastAnswerMillis) {
          const lastAnswerDate = new Date(lastAnswerMillis);
          this.lastAnswerDate =
            this.timeFormatter.format(lastAnswerDate) +
            ' ' +
            this.dateFormatter.format(lastAnswerDate);
        } else {
          this.lastAnswerDate = '';
        }
      } else {
        this.lastAnswerDate = '';
      }

      this.initializeReactiveData();
      this.messageText = this.messageData.text || this.messageText;
    }
    this.loadAllMessageInConversation();
    this.loadThreadAnswers();
    this.conversationservice.updateConvMessageThreadCount(this.messageData?.conversationmessageId || '', this.messageData?.id || '')
  }

  private normalizeTimestamp(ts: any): number {
    if (!ts) return 0;

    if (typeof ts === 'number') return ts;

    if (typeof ts === 'string') {
      const parsed = new Date(ts).getTime();
      return isNaN(parsed) ? 0 : parsed;
    }

    if (ts instanceof Date) return ts.getTime();

    if (typeof ts === 'object' && 'seconds' in ts) {
      return ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1_000_000);
    }

    return 0;
  }

  /**
  * Angular lifecycle hook that runs when input properties change.
  * Re-initializes reactive data if messageData is present.
  */
  ngOnChanges(): void {

    if (this.messageData) {
      this.initializeReactiveData();
    } 
  }

  /**
   * Initializes reactive observables for thread count and last answer.
   * Updates the thread count for the current message.
   */
  private initializeReactiveData(): void {
    if (!this.messageData) return;

    this.threadCount$ = typeof this.messageData.threadCount === 'number'
      ? of(this.messageData.threadCount)
      : this.messageData.threadCount || of(0);

    this.lastAnswer$ = this.conversationservice.allMessages$.pipe(
      map(() => {
        if (!this.messageData) return '';

        const lastAnswer = this.conversationservice.getLastAnswer(this.messageData);
        if (lastAnswer && lastAnswer.timestamp) {
          return this.formatTimestamp(lastAnswer.timestamp);
        }
        return '';
      })
    );
    this.conversationservice.updateConvMessageThreadCount(this.messageData?.conversationmessageId || '', this.messageData?.id || '')
  }

  /**
  * Loads all messages in the current conversation and assigns them to allMessages.
  * Subscribes to allMessages$ observable from the conversation service.
  */
  loadAllMessageInConversation() {
    this.conversationservice.allMessages$.subscribe((messages) => {
      this.allMessages = messages;
    });
  }

  /**
  * Angular lifecycle hook that runs after the component's view has been fully initialized.
  * Sets the isOwn property based on the senderId and actual user.
  */
  ngAfterViewInit(): void {
    if (this.messageData && this.maincomponentservice.actualUser[0]) {
      setTimeout(() => {
        this.isOwn =
          this.messageData?.senderId ===
          this.maincomponentservice.actualUser[0].id;
      }, 0);
    }
    this.mainHelperService.focusDirectMessage$.subscribe(() => {
      setTimeout(() => this.directInput?.nativeElement.focus());
    });
  }

  /**
   * Toggles the visibility of the edit popup for editing a message.
   */
  toggleEditPopup() {
    this.showEditPopup = !this.showEditPopup;
  }

  /**
   * Prepares the component for editing the message text.
   * Opens the edit popup and initializes the editedMessageText property.
   */
  overwriteMessage() {
    this.toggleEditPopup();
    this.editMessage = true;
    this.editedMessageText = this.messageText;
  }

  /**
   * Deletes the current message from Firestore and updates the thread count.
   * Closes the edit popup after deletion.
   */
  async deleteMessage() {
    const conversationId = this.conversationId;
    const conversationmessageId = this.conversationmessageid;

    if (conversationId && conversationmessageId) {
      const messageDocRef = this.conversationservice.firestore
        ? doc(this.conversationservice.firestore, 'conversation', conversationId, 'messages', conversationmessageId)
        : null;

      if (messageDocRef) {
        await deleteDoc(messageDocRef);
        this.conversationservice.updateConvMessageThreadCount(conversationId, conversationId);
        this.editMessage = false;
        this.toggleEditPopup();
      }
    }
  }

  /**
   * Saves the edited message text to Firestore and updates the local messageText.
   * Closes the edit popup after saving.
   */
  async saveEditedMessage() {
    if (!this.messageData || !this.editedMessageText.trim()) return;

    const conversationId = this.conversationId;
    const conversationmessageId = this.conversationmessageid;
    const newText = this.editedMessageText.trim();

    if (conversationId && conversationmessageId) {
      const messageDocRef = this.conversationservice.firestore
        ? doc(this.conversationservice.firestore, 'conversation', conversationId, 'messages', conversationmessageId)
        : null;

      if (messageDocRef) {
        await updateDoc(messageDocRef, { text: newText });
        this.messageText = newText;
        this.editMessage = false;
        this.toggleEditPopup();
      }
    }
  }

  /**
   * Closes the edit popup and exits edit mode.
   */
  closeEditPopup() {
    this.editMessage = false;
    this.showEditPopup = false;
  }

  /**
   * Adds an emoji reaction to the current message.
   * @param event The emoji event or emoji string.
   * @param conversationId The ID of the conversation.
   * @param conversationmessagId The ID of the message.
   */
  addEmoji(event: any, conversationId: string, conversationmessagId: string) {
    const emoji = event.emoji?.native || event;
    if (!conversationmessagId) return;
    this.conversationservice.addEmojiInMessage(emoji, conversationId, conversationmessagId);
  }

  /**
   * Toggles the visibility of the emoji picker bar.
   */
  showEmojiBar() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  /**
   * Handles the emoji button click event and prevents event bubbling.
   * @param event The mouse event.
   */
  onEmojiButtonClick(event: MouseEvent) {
    event.stopPropagation(); // verhindert Auslösung von handleClickOutside
    this.showEmojiBar();
  }

  /**
   * Handles clicks outside the emoji picker and closes it if necessary.
   * @param event The mouse event.
   */
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    const clickedInsideEmoji =
      (this.emojiComponent?.nativeElement && this.emojiComponent.nativeElement.contains(target)) ||
      (this.emojiImg?.nativeElement && this.emojiImg.nativeElement.contains(target)) ||
      (this.emojiImgWriter?.nativeElement && this.emojiImgWriter.nativeElement.contains(target));

    if (!clickedInsideEmoji) {
      this.showEmojiPicker = false;
    }
  }

  /**
   * Emits the replyClicked event and opens the thread for the current message.
   * Loads thread answers for the message.
   */
  onReplyClick(): void {
    if (this.messageData) {
      this.replyClicked.emit(this.messageData);

      this.conversationservice.openThread(this.messageData);
      this.loadThreadAnswers();
    } else {
      console.error(this.messageData, 'not found')
    }
    this.mainHelperService.focusThreadMessage$.next();
  }

  /**
   * Loads thread answers for the current message and updates the threadAnswers array.
   * Subscribes to allMessages$ observable from the conversation service.
   */
  loadThreadAnswers(): void {
    if (this.allThreadsSubscription) {
      this.allThreadsSubscription.unsubscribe();
    }

    this.allThreadsSubscription =
      this.conversationservice.allMessages$.subscribe((messages) => {
        if (this.messageData && this.messageData.id) {
          const messageId = this.messageData.conversationmessageId;
          this.threadAnswers = this.conversationservice.getThreadAnswers(messageId);
          this.conversationservice.updateThreadAnswers(messageId);
        }
      });
  }

  /**
   * Formats a timestamp into a human-readable date and time string.
   * @param timestamp The timestamp to format.
   * @returns The formatted date and time string.
   */
  private formatTimestamp(timestamp: any): string {
    let dateObj: Date;

    if (timestamp instanceof Date) {
      dateObj = timestamp;
    } else if (timestamp && typeof timestamp.toDate === 'function') {
      dateObj = timestamp.toDate();
    } else {
      dateObj = new Date(timestamp);
    }

    if (!dateObj || isNaN(dateObj.getTime())) {
      return '';
    }

    try {
      return (
        this.timeFormatter.format(dateObj) +
        ' ' +
        this.dateFormatter.format(dateObj)
      );
    } catch (e) {
      console.warn('Failed to format timestamp:', timestamp, e);
      return '';
    }
  }

  public putFocusOnInput() {
    this.directInput.nativeElement.focus();
  }

  /**
   * Angular lifecycle hook that runs when the component is destroyed.
   * Unsubscribes from the allThreadsSubscription to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if (this.allThreadsSubscription) {
      this.allThreadsSubscription.unsubscribe();
    }
  }
}

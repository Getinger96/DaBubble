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
  
  

  @Input() emojiReactionsThead?: { [emoji: string]: { count: number; users: string[] } }; 
  @ViewChild('emojiComponent') emojiComponent!: ElementRef<HTMLTextAreaElement>
  @ViewChild('emojiImg') emojiImg!: ElementRef<HTMLTextAreaElement>
  @ViewChild('emojiImgWriter') emojiImgWriter!: ElementRef<HTMLTextAreaElement>

  threadCount$: Observable<number> = of(0);
  lastAnswer$: Observable<string> = of('');
  showEmojiPicker: boolean = false;
  conversationmessageid: string = '';
  editedMessageText: string = '';
  conversationId: string = '';
  editMessage: boolean = false;
  showEditPopup: boolean = false;
  emojiReactions = new Map<string, { count: number, users: string[] }>();
  allMessages: ConversationMessage[] = [];
  threadAnswers: ConversationMessage[] = [];

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

  ) { }

  ngOnInit(): void {
    if (this.messageData) {
      const timestamp = this.messageData.timestamp;
      this.conversationmessageid = this.messageData.conversationmessageId;
      this.conversationId = this.messageData.id;

      this.conversationservice.getReactionsForMessage(
        this.messageData.id,
        this.messageData.conversationmessageId,
        (reactionMap) => {
          this.emojiReactions = reactionMap;
          console.log(this.emojiReactions);

        }
      );


      let dateObj: Date;

      if (timestamp instanceof Date) {
        dateObj = timestamp;
      } else if (timestamp && typeof (timestamp as any).toDate === 'function') {
        dateObj = (timestamp as any).toDate();
      } else {
        dateObj = new Date(timestamp);
      }

      this.date = this.dateFormatter.format(dateObj);
      this.time = this.timeFormatter.format(dateObj);

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

      // Get last answer for thread display
      const lastAnswer = this.conversationservice.getLastAnswer(
        this.messageData
      );
      if (lastAnswer && lastAnswer.timestamp) {
        const lastAnswerDate = new Date(lastAnswer.timestamp);
        this.lastAnswerDate =
          this.timeFormatter.format(lastAnswerDate) +
          ' ' +
          this.dateFormatter.format(lastAnswerDate);
      } else {
        this.lastAnswerDate = '';
      }

            // Initialize reactive observables
      this.initializeReactiveData();

      this.messageText = this.messageData.text || this.messageText;
    }
     this.loadAllMessageInConversation();
     this.loadThreadAnswers();
     this.conversationservice.updateConvMessageThreadCount(this.messageData?.conversationmessageId || '', this.messageData?.id || '')
  }

  ngOnChanges(): void {

        if (this.messageData) {
  this.initializeReactiveData();
    } else {
      console.log('no Message Data')
    }
  }

   private initializeReactiveData(): void {
    if (!this.messageData) return;

    // Set up threadCount$ observable
    this.threadCount$ = typeof this.messageData.threadCount === 'number'
      ? of(this.messageData.threadCount)
      : this.messageData.threadCount || of(0);

    // Set up lastAnswer$ observable that reacts to thread changes
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


  // Load all messages in conversation
  loadAllMessageInConversation() {
    this.conversationservice.allMessages$.subscribe((messages) => {
      this.allMessages = messages;
    });
    console.log('this.allMessages',this.allMessages);
    
  }

  ngAfterViewInit(): void {
    if (this.messageData && this.maincomponentservice.actualUser[0]) {
      setTimeout(() => {
        this.isOwn =
          this.messageData?.senderId ===
          this.maincomponentservice.actualUser[0].id;
      }, 0);
    }
  }



  toggleEditPopup() {
    this.showEditPopup = !this.showEditPopup;
  }

overwriteMessage() {
  this.toggleEditPopup();
  this.showEditPopup = false;
  this.editMessage = true;
  this.editedMessageText = this.messageText; // Initialize with current text
}

async deleteMessage(){
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
      this.showEditPopup = false;
    }
  }
}

async saveEditedMessage() {
  if (!this.messageData || !this.editedMessageText.trim()) return;

  // Update in Firestore
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
      this.showEditPopup = false;
    }
  }
}

  closeEditPopup() {
    this.editMessage = false;
    this.showEditPopup = false;
  }


  addEmoji(event: any, conversationId: string, conversationmessagId: string) {
    const emoji = event.emoji?.native || event;
    if (!conversationmessagId) return;
    this.conversationservice.addEmojiInMessage(emoji, conversationId, conversationmessagId);
  }

  showEmojiBar() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  onEmojiButtonClick(event: MouseEvent) {
    event.stopPropagation(); // verhindert Auslösung von handleClickOutside
    this.showEmojiBar();
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    const clickedInsideEmoji =
      (this.emojiComponent?.nativeElement && this.emojiComponent.nativeElement.contains(target)) ||
      (this.emojiImg?.nativeElement && this.emojiImg.nativeElement.contains(target)) ||
      (this.emojiImgWriter?.nativeElement && this.emojiImgWriter.nativeElement.contains(target));

    console.log('this.emojiComponent?', this.emojiComponent);





    if (!clickedInsideEmoji) {
      this.showEmojiPicker = false;
    }
  }

  // Thread functionality
  onReplyClick(): void {
    if (this.messageData) {
      this.replyClicked.emit(this.messageData);

      this.conversationservice.openThread(this.messageData);
      this.loadThreadAnswers();
    } else {
      console.error(this.messageData, 'not found')
    }
  }


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

  private formatTimestamp(timestamp: any): string {
    let dateObj: Date;
    if (timestamp instanceof Date) {
      dateObj = timestamp;
    } else if (timestamp && typeof timestamp.toDate === 'function') {
      dateObj = timestamp.toDate();
    } else {
      dateObj = new Date(timestamp);
    }
    return (
      this.timeFormatter.format(dateObj) +
      ' ' +
      this.dateFormatter.format(dateObj)
    );
  }

  ngOnDestroy(): void {
    if (this.allThreadsSubscription) {
      this.allThreadsSubscription.unsubscribe();
    }
  }
}

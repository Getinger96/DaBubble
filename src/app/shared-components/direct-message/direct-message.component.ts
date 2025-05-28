import { Component, ElementRef, HostListener, Input, NgModule, ViewChild } from '@angular/core';
import { MessageComponent } from '../message/message.component';
import { MessageService } from '../../firebase-services/message.service';
import { ConversationService } from '../../firebase-services/conversation.service'; // Add this import
import { ConversationMessage } from '../../interfaces/conversation-message.interface';
import { CommonModule } from '@angular/common';
import { MainComponentService } from '../../firebase-services/main-component.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { Subscription } from 'rxjs';
import { ConversationService } from '../../firebase-services/conversation.service';
import { Conversation } from '../../interfaces/conversation.interface';

@Component({
  selector: 'app-direct-message',
  standalone: true,
  imports: [CommonModule, PickerComponent],
  templateUrl: './direct-message.component.html',
  styleUrl: '../message/message.component.scss',
})
export class DirectMessageComponent {
  @Input() messageData: ConversationMessage | undefined;
  @Input() date!: Date | string;
  @Input() avatarSrc!: number;
  @Input() name!: string;
  @Input() time!: Date | string;
  @Input() messageText!: string;
  @Input() isOwn: boolean | undefined = false;
  @Input() dateExists: boolean | undefined = false;
  @Input() isThread: boolean | undefined = false;
showEmojiPicker: boolean = false;
@ViewChild('emojiComponent') emojiComponent!: ElementRef<HTMLTextAreaElement>
@ViewChild('emojiImg') emojiImg!: ElementRef<HTMLTextAreaElement>
@ViewChild('emojiImgWriter') emojiImgWriter!: ElementRef<HTMLTextAreaElement>
conversationmessageid:string = '';
conversationId:string='';
editMessage: boolean = false;
showEditPopup: boolean = false;
emojiReactions = new Map<string, { count: number, users: string[] }>();

dateFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
});
  @Input() isInThread: boolean | undefined = false;
  @Input() lastAnswerDate!: string;

  // Component state
  allMessages: ConversationMessage[] = [];
  threadAnswers: ConversationMessage[] = [];
  editMessage: boolean = false;
  showEditPopup: boolean = false;

  // Subscriptions
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
  private conversationservice: ConversationService

) { }

ngOnInit(): void {
  if(this.messageData) {
  const timestamp = this.messageData.timestamp;
 this.conversationmessageid=this.messageData.conversationmessageId;
 this.conversationId=this.messageData.id;

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
      const lastAnswer = this.conversationService.getLastAnswer(
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

  this.messageText = this.messageData.text || this.messageText;
}
console.log('Direct Message:', this.messageData);
  }

  // Load all messages in conversation
  loadAllMessageInConversation() {
    this.conversationService.allMessages$.subscribe((messages) => {
      this.allMessages = messages;
    });
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
      this.conversationService.openThread(this.messageData);
      this.loadThreadAnswers();
    }
  }

  loadThreadAnswers(): void {
    if (this.allThreadsSubscription) {
      this.allThreadsSubscription.unsubscribe();
    }

    this.allThreadsSubscription =
      this.conversationService.allMessages$.subscribe((messages) => {
        if (this.messageData && this.messageData.id) {
          // Filter and set thread answers
          const messageId = this.messageData.id;
          this.threadAnswers =
            this.conversationService.getThreadAnswers(messageId);

          // Update thread answers
          this.conversationService.updateThreadAnswers(messageId);

          // Update last answer date
          this.lastAnswerDate = this.conversationService?.lastAnswer?.timestamp
            ? this.formatTimestamp(
                this.conversationService.lastAnswer.timestamp
              )
            : '';
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

import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener } from '@angular/core';
import { MessageService } from '../../firebase-services/message.service';
import { Message } from '../../interfaces/message.interface';
import { DatePipe } from '@angular/common';
import { MainComponentsComponent } from '../../main-components/main-components.component';
import { Subscription } from 'rxjs';
import { ChannelMessageService } from '../../firebase-services/channel-message.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, PickerComponent],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss',
})
export class MessageComponent {
  @Input() messageData: Message | undefined;
  @Input() date!: Date | string | null;
  @Input() avatarSrc!: number;
  @Input() name!: string;
  @Input() time!: Date | string;
  @Input() messageText!: string;
  @Input() reaction!: number;
  @Input() isOwn: boolean | undefined = false;
  @Input() isThread: boolean | undefined = false;
  @Input() isInThread: boolean | undefined = false;
  @Input() isAnswered: boolean | undefined = false;
  @Input() threadCount: number = 0;
  @Input() threadTo!: string;
  @Input() dateExists: boolean | undefined = false;
  @Input() lastAnswerDate!: string;
  @Input() channelID!: string;
  @ViewChild('emojiComponent') emojiComponent!: ElementRef<HTMLTextAreaElement>
  @ViewChild('emojiImg') emojiImg!: ElementRef<HTMLTextAreaElement>
  mainComponents = MainComponentsComponent;
  private allThreadsSubscription!: Subscription;
  threadAnswers: Message[] = [];
  isEditPopupOpened: boolean = false;
  static editMessage: boolean = false;
  static showEditPopup: boolean = false;
  showEditPopup = MessageComponent.showEditPopup;
  editMessage = MessageComponent.showEditPopup;
  emojiReactions = new Map<string, { count: number, users: string[] }>();
  showEmojiPicker: boolean = false;
  hover = false;
  constructor(private messageService: MessageService, private channelmessageService: ChannelMessageService) { }

  ngOnInit(): void {

    if (this.messageData) {
     this.date=this.messageData.sendAt
      this.avatarSrc = this.messageData.avatar || this.avatarSrc;
      this.name = this.messageData.name || this.name;
      this.time = this.messageData.sendAtTime;
      this.messageText = this.messageData.messageText || this.messageText;
      this.reaction = this.messageData.reaction || this.reaction;
      this.isOwn = this.messageData.isOwn ?? this.isOwn;
      this.isThread = this.messageData.isThread ?? this.isThread;
      this.isInThread = this.messageData.isInThread ?? this.isInThread;
      this.isAnswered = this.messageData.isAnswered ?? this.isAnswered;
      this.threadCount = this.messageData.threadCount || this.threadCount;
      this.threadTo = this.messageData.threadTo ?? this.threadTo;
      this.channelID = this.messageData.channelId ?? this.channelID;
      this.channelmessageService.getReactionsForMessage(
        this.messageData.channelId,
        this.messageData.messageId,
        (reactionMap) => {
          this.emojiReactions = reactionMap;
        }
      );
      const lastAnswer = this.channelmessageService.getLastAnswer(this.messageData);
      if (lastAnswer && lastAnswer.sendAtTime && lastAnswer.sendAt) {
        this.lastAnswerDate = lastAnswer.sendAtTime + ' ' + lastAnswer.sendAt;
      } else {
        this.lastAnswerDate = '';
      }
    } else {
      console.log('no Message Data')
    }

  }




  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    const clickedInsideEmoji = this.emojiComponent?.nativeElement?.contains(target)
      || this.emojiImg.nativeElement?.contains(target);



    if (!clickedInsideEmoji) {
      this.showEmojiPicker = false;
    }

  }
  // onReactionClick(emoji: string) {
  // if (this.messageData) {
  //this.channelmessageService.toggleReaction(
  // emoji === '✅' ? 'check' : 'like',
  //this.messageData.channelId
  //);
  //}

  // }
  onReplyClick(): void {
    if (this.messageData) {
      this.channelmessageService.openThread(this.messageData);
      this.loadThreadAnswers();
    }
  }

  loadThreadAnswers(): void {
    this.allThreadsSubscription = this.channelmessageService.allMessages$.subscribe(
      (messages) => {
        if (this.messageData) {
          this.threadAnswers = messages.filter((message) => message.isThread);
          this.threadAnswers = this.channelmessageService.getThreadAnswers(
            this.messageData.messageId
          );
          this.channelmessageService.updateThreadAnswers(this.messageData.messageId);
          this.lastAnswerDate =
            (this.messageService?.lastAnswer?.sendAtTime ?? '') +
            (this.messageService?.lastAnswer?.sendAt ?? '');
        }
      }
    );
  }


  showEmojiBar() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  overwriteMessage() {
    this.toggleEditPopup();
    MessageComponent.showEditPopup = false;
    MessageComponent.editMessage = true;
  }

  closeEditPopup() {
    this.editMessage = false;
    MessageComponent.showEditPopup = false;
  }


  toggleEditPopup(): void {
    MessageComponent.showEditPopup = !MessageComponent.showEditPopup;
  }

  addNewReaction(reaction: string, channelID: string, messageId?: string) {
    if (!messageId) return;
    this.channelmessageService.toggleReaction(reaction, channelID, messageId);
  }

  ngOnDestroy(): void {
    if (this.allThreadsSubscription) {
      this.allThreadsSubscription.unsubscribe();
    }
  }

 
}

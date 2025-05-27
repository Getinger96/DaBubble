import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter,OnChanges, ViewChild, ElementRef, HostListener, SimpleChanges, input, OnInit  } from '@angular/core';
import { MessageService } from '../../firebase-services/message.service';
import { Message } from '../../interfaces/message.interface';
import { DatePipe } from '@angular/common';
import { MainComponentsComponent } from '../../main-components/main-components.component';
import { Subscription } from 'rxjs';
import { ChannelMessageService } from '../../firebase-services/channel-message.service';
import { ChannelService } from '../../firebase-services/channel.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, PickerComponent],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss',
})
export class MessageComponent implements OnChanges {
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
  @Input() channelIdThread!: string;
  @Input() threadAnswersId!: string
  @Input() channelID!: string;
  @Input() selectedMessageId!: string;
  @Input() selectedChannelId!: string;
  @Input() emojiReactionsThead?: { [emoji: string]: { count: number; users: string[] } }; 
  @ViewChild('emojiComponent') emojiComponent!: ElementRef<HTMLTextAreaElement>
  @ViewChild('emojiImg') emojiImg!: ElementRef<HTMLTextAreaElement>
  @ViewChild('emojiImgWriter') emojiImgWriter!: ElementRef<HTMLTextAreaElement>
  @ViewChild('emojiThreadMask') emojiThreadMask!: ElementRef<HTMLTextAreaElement>
  @ViewChild('emojiThread') emojiThread!: ElementRef<HTMLTextAreaElement>
  mainComponents = MainComponentsComponent;
  private allThreadsSubscription!: Subscription;
  allMessages: Message[] = []
  threadAnswers: Message[] = [];
  isEditPopupOpened: boolean = false;
  editMessage: boolean = false;
  showEditPopup: boolean = false;
  emojiReactions = new Map<string, { count: number, users: string[] }>();
  showEmojiPicker: boolean = false;
  showEmojiPickerThread: boolean = false;
  hover = false;
  currentChannelId?:string
  message: Message[] = [];
  constructor(private messageService: MessageService, private channelmessageService: ChannelMessageService, private channelService: ChannelService ) { 
     
  }

  ngOnChanges(changes: SimpleChanges) {
    this.loadChannelId();
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
      this.threadAnswersId = this.messageData.messageId;
      this.channelIdThread = this.messageData.channelId;
      console.log('wthis.threadAnswersId,this.channelIdThreader',this.threadAnswersId,this.channelIdThread );
      
      this.channelmessageService.getReactionsForMessage(
        this.messageData.channelId,
        this.messageData.messageId,
        (reactionMap) => {
          this.emojiReactions = reactionMap;
          console.log(this.emojiReactions);
          
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

    loadAllMessageInChannel() {
    this.channelmessageService.allMessages$.subscribe(Message => {
      this.allMessages = Message;
    });
  }
  



  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

const clickedInsideEmoji =
  (this.emojiComponent?.nativeElement && this.emojiComponent.nativeElement.contains(target)) ||
  (this.emojiImg?.nativeElement && this.emojiImg.nativeElement.contains(target)) ||
  (this.emojiImgWriter?.nativeElement && this.emojiImgWriter.nativeElement.contains(target));

    console.log('this.emojiComponent?',this.emojiComponent);


    const clickedInsideEmojiThread = 
      this.emojiThreadMask?.nativeElement.contains(target) || this.emojiThread?.nativeElement.contains(target)
    

    if (!clickedInsideEmoji) {
      this.showEmojiPicker = false;
    }

      if (!clickedInsideEmojiThread) {
      this.showEmojiPickerThread = false;
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


  loadChannelId() {
    this.channelService.currentChannelId$.subscribe(id => {
      this.currentChannelId = id;
    });
  }
loadThreadAnswers(): void {
  this.allThreadsSubscription = this.channelmessageService.allMessages$.subscribe(
    (messages) => {
      if (this.messageData) {
        // Thread-Antworten filtern und setzen
        this.threadAnswers = this.channelmessageService.getThreadAnswers(this.messageData.messageId);

        // Emojis für jede Thread-Antwort laden
        this.loadEmojisForThreadAnswers();

        this.channelmessageService.updateThreadAnswers(this.messageData.messageId);

        this.lastAnswerDate =
          (this.messageService?.lastAnswer?.sendAtTime ?? '') +
          (this.messageService?.lastAnswer?.sendAt ?? '');
      }
    }
  );
}

loadEmojisForThreadAnswers(): void {
  if (!this.threadAnswers || this.threadAnswers.length === 0) return;

  this.threadAnswers.forEach(msg => {
    this.channelmessageService.getReactionsForMessage(
      msg.channelId,
      msg.messageId,
      (reactionMap) => {
        // Hier die Reaktionen dem jeweiligen Thread-Message-Objekt hinzufügen
    (msg as any)['emojiReactions'] = reactionMap;
      }
    );
  });
}



  showEmojiBar() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }


  showEmojiBarThread() {
        this.showEmojiPickerThread = !this.showEmojiPickerThread;
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


  toggleEditPopup(): void {
    this.showEditPopup = !this.showEditPopup;
  }




  addEmoji(event: any, channelID: string, messageId?: string) {
  const emoji = event.emoji?.native || event;
        if (!messageId) return;
 this.channelmessageService.addEmojiInMessage(emoji, channelID, messageId);
  }

  handleEmojiClick(event: any,): void {
  const emoji = event.emoji?.native || event;

  const messageId = this.threadAnswersId ?? this.messageData?.messageId ?? this.selectedMessageId;
  const channelId = this.channelIdThread ?? this.messageData?.channelId ?? this.selectedChannelId;

  if (!messageId || !channelId) {
    console.warn('Missing messageId or channelId for emoji reaction', { messageId, channelId });
    return;
  }

  this.channelmessageService.addEmojiInMessage(emoji, channelId, messageId);
  this.showEmojiPickerThread = false;
}

  ngOnDestroy(): void {
    if (this.allThreadsSubscription) {
      this.allThreadsSubscription.unsubscribe();
    }
  }

 
}

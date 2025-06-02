import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef,HostListener} from '@angular/core';
import { Message } from '../../interfaces/message.interface';
import { DirectMessageComponent } from '../../shared-components/direct-message/direct-message.component';
import { MessageComponent } from '../../shared-components/message/message.component';
import { CommonModule } from '@angular/common';
import { MainComponentsComponent } from '../main-components.component';
import { MessageService } from '../../firebase-services/message.service';
import { MainComponentService } from '../../firebase-services/main-component.service';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChannelMessageService } from '../../firebase-services/channel-message.service';
import { ChannelService} from '../../firebase-services/channel.service'
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { Member } from '../../interfaces/member.interface';
import { AddMemberToThreadComponent } from './add-member-to-thread/add-member-to-thread.component';
import { ConversationMessage } from '../../interfaces/conversation-message.interface';
import { ConversationService } from '../../firebase-services/conversation.service';
@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [MessageComponent, CommonModule, FormsModule, PickerComponent, DirectMessageComponent, AddMemberToThreadComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss',
})
export class ThreadComponent {
  @Input() selectedMessage: Message | null = null;
  @Input() selectedConvMessage: ConversationMessage | null = null;
  @Output() openThread = new EventEmitter<void>();
  @Output() closeThread = new EventEmitter<void>();
  mainComponents = MainComponentsComponent;
  private allThreadsSubscription!: Subscription;
  private allConvThreadsSubscription!: Subscription;
  @ViewChild('threadFeed') private threadFeed!: ElementRef;
  @ViewChild('addMemberAtImg') private addMemberAtImg!: ElementRef
  @ViewChild('addMember') private addMember!: ElementRef
  @ViewChild('addEmojiImg') private addEmojiImg!: ElementRef
  @ViewChild('emojiComponent') private emojiComponent!: ElementRef
  currentChannelID?: string
  threadAnswers: Message[] = [];
  threadConvAnswers: ConversationMessage[] = [];
  showEmojiPicker: boolean = false;
  private selectedMessageSubscription!: Subscription;
  private threadRepliesSubscription!: Subscription;
  emojiReactions = new Map<string, { [emoji: string]: { count: number, users: string[] } }>();
  members: Member[] =[]
  newThreadText: string = '';
  toggleMemberInThread: boolean = false;
  toggleEmoji: boolean = false;
  constructor( private elementRef: ElementRef,
    public messageService: MessageService,
    private mainService: MainComponentService,
    private cdr: ChangeDetectorRef,
    private channelmessageservice:ChannelMessageService,
    private channelService: ChannelService,
    private conversationService: ConversationService
  ) {}

  ngOnInit(): void {
    this.loadChannelId();
    this.loadMembers();
  if (this.mainService.showdirectmessage) {
    this.selectedMessageSubscription = this.conversationService.selectedThreadMessage$.subscribe((message) => {
      console.log('Selected Conversationmessage updated:', message);
      this.selectedConvMessage = message;
      if (message?.id) {
        this.loadConvThreadAnswers();
      }
    });
  } else {
    this.selectedMessageSubscription = this.channelmessageservice.selectedThreadMessage$.subscribe((message) => {
      console.log('Selected message updated:', message);
      this.selectedMessage = message;
      if (message?.messageId) {
        this.loadThreadAnswers();
      }
    });
  }

    this.threadRepliesSubscription =
      this.channelmessageservice.threadReplies$.subscribe((replies) => {
        console.log('Thread replies updated:', replies);
        this.threadAnswers = replies;
      });

    setTimeout(() => this.scrollToBottom(), 0);
  }


    @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
       const target = event.target as HTMLElement;

    this.handleEmojiWindow(target)
           const clickedAddMember = this.addMemberAtImg?.nativeElement?.contains(target)
      || this.addMember?.nativeElement?.contains(target);

    if (!clickedAddMember) {
      this.toggleMemberInThread = false;
    }
       
  }


  handleEmojiWindow(target:HTMLElement) {
           const clickedEmojiWindow = this.emojiComponent?.nativeElement?.contains(target)
      || this.addEmojiImg?.nativeElement?.contains(target);

    if (!clickedEmojiWindow) {
          this.toggleEmoji = false;
  }

}

 

  scrollToBottom(): void {
    try {
      this.threadFeed.nativeElement.scrollTop = this.threadFeed.nativeElement.scrollHeight;
    } catch (err) { }
  }


  loadChannelId() {
       this.channelService.currentChannelId$.subscribe(id => {
      this.currentChannelID = id;
    });
  }

    showEmojiBar() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }
  
loadReaction() {
  if (!this.currentChannelID) {
    console.error("ChannelID fehlt!");
    return;
  }

  // Für selectedMessage laden
  if (this.selectedMessage?.messageId) {
    this.channelmessageservice.getReactionsForMessage(
      this.currentChannelID,
      this.selectedMessage.messageId,
      (reactionMap: any) => {
        this.emojiReactions.set(this.selectedMessage!.messageId, reactionMap);
      }
    );
  }

  // Für jede Thread-Antwort laden
  this.threadAnswers.forEach((message) => {
    this.channelmessageservice.getReactionsForMessage(
      this.currentChannelID!,
      message.messageId,
      (reactionMap: any) => {
        this.emojiReactions.set(message.messageId, reactionMap);
            console.log('this.threadAnswerswerwer', this.emojiReactions.set(message.messageId, reactionMap));
      }
      
    );
      console.log('this.threadAnswers', this.threadAnswers, this.threadAnswers[0].id);
  });

  
}

  openDialogAddMember() {

    this.toggleMemberInThread = !this.toggleMemberInThread;
    if (this.toggleEmoji) {
      this.toggleEmoji = false
    }
  }



  openEmojiWindow() {
        this.toggleEmoji = !this.toggleEmoji;
    if (this.toggleMemberInThread) {
      this.toggleMemberInThread = false
    }
  }


   insertMemberIntoTextarea(member: Member) {
    const insertText = `@${member.name} `;
    this.newThreadText += insertText;

  }


  addEmoji(event:any){
        const emoji = event.emoji.native;
         this.newThreadText += emoji;
  }

  loadMembers() {
    this.channelService.channelMember$.subscribe(members => {
      this.members = members;
      console.log('this.members', this.members);

    });
  }

  loadThreadAnswers(): void {
    this.allThreadsSubscription = this.channelmessageservice.allMessages$.subscribe(
      (messages) => {
        this.threadAnswers = messages.filter((message) => message.isThread);
        if (this.selectedMessage?.messageId) {
          this.threadAnswers = this.channelmessageservice.getThreadAnswers(
            this.selectedMessage.messageId
          );
          this.loadReaction(); 
        };

      }
    );
  }

    loadConvThreadAnswers(): void {
    this.allConvThreadsSubscription = this.conversationService.allMessages$.subscribe(
      (messages) => {
        this.threadConvAnswers = messages.filter((message) => message.isThread);
        if (this.selectedConvMessage?.id) {
          this.threadConvAnswers = this.conversationService.getThreadAnswers(
            this.selectedConvMessage.id
          );
          this.loadReaction(); 
        };

      }
    );
  }

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

  formatTimestamp(timestamp: any): string {
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
      ' Uhr ' +
      this.dateFormatter.format(dateObj)
    );
  }


  formatTime(timestamp: any): string {
    let dateObj: Date;
    if (timestamp instanceof Date) {
      dateObj = timestamp;
    } else if (timestamp && typeof timestamp.toDate === 'function') {
      dateObj = timestamp.toDate();
    } else {
      dateObj = new Date(timestamp);
    }
    return this.timeFormatter.format(dateObj);
  }
  

  closeThreads(): void {
    this.mainComponents.toggleThreads();
    this.closeThread.emit();
  }

  async sendReply(): Promise<void> {
    if (!this.newThreadText.trim() || !this.selectedMessage?.messageId) return;
    await this.channelmessageservice.addThreadAnswer(
      this.newThreadText,
      this.selectedMessage.messageId,
      this.selectedMessage
    );
    this.newThreadText = '';
    this.loadThreadAnswers();
    this.channelmessageservice.sortAllMessages(this.threadAnswers);
    this.scrollToBottom()
  }

    async sendConvReply(): Promise<void> {
    if (!this.newThreadText.trim() || !this.selectedConvMessage?.id) return;
    await this.conversationService.addConvThreadAnswer(
      this.newThreadText,
      this.selectedConvMessage.id,
      this.selectedConvMessage
    );
    this.newThreadText = '';
    this.loadConvThreadAnswers();
    this.conversationService.sortAllMessages(this.threadConvAnswers);
    this.scrollToBottom()
  }

  ngOnDestroy(): void {
    if (this.allThreadsSubscription) {
      this.allThreadsSubscription.unsubscribe();
    }
       if (this.allConvThreadsSubscription) {
      this.allConvThreadsSubscription.unsubscribe();
    }
  }
}

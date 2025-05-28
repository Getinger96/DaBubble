import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MessageComponent } from '../../shared-components/message/message.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../firebase-services/message.service';
import { Message } from '../../interfaces/message.interface';
import { Subscription } from 'rxjs';
import { RegisterService } from '../../firebase-services/register.service';
import { User } from '../../interfaces/user.interface';
import { MainComponentService } from '../../firebase-services/main-component.service';
import { ConversationService } from '../../firebase-services/conversation.service';
import { DirectMessageComponent } from '../../shared-components/direct-message/direct-message.component';
import { ConversationMessage } from '../../interfaces/conversation-message.interface';
import { MainHelperService } from '../../services/main-helper.service';


@Component({
  selector: 'app-main-chat',
  standalone: true,
  imports: [MessageComponent, CommonModule, FormsModule, DirectMessageComponent],
  templateUrl: './main-chat.component.html',
  styleUrls: ['./main-chat.component.scss']
})

export class MainChatComponent {
  
  allMessages: Message[] = [];
  allThreads: Message[] = [];
  allConversationMessages: ConversationMessage[] = [];
  conversationId: string | null = null;
  newConvMessage: string = '';
  actualUser: User[] = [];
  currentUserId = this.actualUser[0].id;
  partnerUserId = this.mainservice.directmessaeUserIdSubject.value;
  private allMessageSubscription!: Subscription; 
  private actualUserSubscription!: Subscription;
  private allConversationMessageSubscription!: Subscription; 
  @ViewChild('chatFeed') private chatFeed!: ElementRef;
  openChannel = this.mainhelperservice.openChannel;

  
  months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  days = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
  d = new Date();
  month = this.months[this.d.getMonth()];
  dayString = this.days[this.d.getDay()];
  dayNumber = this.d.getDate();
  minutes = this.d.getMinutes();
  hours = this.d.getHours();
  
  message: Message = {
    id: '',
    messageId:'',
    channelId:'',
    channelName:'',
    name: '',
    avatar: 0,
    messageText: '',
    sendAt: `${this.dayString}, ${this.dayNumber}. ${this.month}`,
    sendAtTime: `${(this.hours<10 ? '0'+this.hours : this.hours)}:${(this.minutes<10 ? '0'+this.minutes : this.minutes)}`,
    timestamp: Date.now(),
    reaction: 0,
    isOwn: false,
    isThread: false,
    isInThread: false,
    isAnswered: false,
    threadTo: '',
    threadCount: 0,
  };

  conversationMessage: ConversationMessage ={
    senderId: '',
    text: '',
    timestamp: new Date(),
    isOwn: false,
    isThread: false,
    isInThread: false,
    threadTo: ''
  }
  static actualUser: any;
  private scrolled = false;

  constructor(private mainhelperservice: MainHelperService ,private messageService: MessageService, private registerService: RegisterService, private mainservice: MainComponentService, private conversationservice: ConversationService) {
  }

  async ngOnInit() {
    
    this.loadActualUser();
    this.loadMessages();
    setTimeout(() => this.scrollToBottom(), 0);
    this.conversationId = await this.conversationservice.getOrCreateConversation(
      this.currentUserId,
      this.partnerUserId
    );

        const initialConvMessages = await this.conversationservice.getInitialConvMessages(this.conversationId);
    this.allConversationMessages = initialConvMessages;

    this.conversationservice.listenToMessages(this.conversationId, (liveMessages) => {
      this.allConversationMessages = liveMessages;
    });

    
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

  loadMessages() {
    this.allMessageSubscription = this.messageService.allMessages$.subscribe((messages) => {
      this.allMessages = messages.filter(message => !message.isThread);
      this.messageService.sortAllMessages(this.allMessages);
      this.allThreads = messages.filter(message => message.isThread);
    });
  }

  loadConversationMessages(){
    if(!this.mainhelperservice.openChannel){
    this.allConversationMessageSubscription = this.conversationservice.allConversationMessagesSubject.subscribe((messages) => {
      this.allConversationMessages = messages;
      this.conversationservice.sortAllMessages(this.allConversationMessages);
    })
    }
  }

  loadConversationMessageSender(message:ConversationMessage){
    if(message.isOwn){
      return this.actualUser[0].name;
    } else{
      return this.mainservice.directmessaeUserNameSubject.value;
    }
  }

  loadConversationMessageSenderAvatar(message:ConversationMessage){
    if(message.isOwn){
      return this.actualUser[0].avatar;
    } else{
      return this.mainservice.directmessaeUserAvatarSubject.value;
    }
  }

  loadActualUser(){
    this.actualUserSubscription = this.mainservice.acutalUser$.subscribe(actualUser => {
      if (actualUser.length > 0) {
        this.actualUser = actualUser;
        console.log('aktueller User:', this.actualUser);
      }
    });
  }

  loadChannelOpen(){

  }

  ngOnDestroy(): void {
    if (this.allMessageSubscription) {
      this.allMessageSubscription.unsubscribe();
    }
    if (this.actualUserSubscription) {
      this.actualUserSubscription.unsubscribe();
    }
    if (this.allConversationMessageSubscription) {
      this.allConversationMessageSubscription.unsubscribe();
    }
  }

  async addMessage() {
    this.message.id = this.actualUser[0]?.id || '';
    this.message.name = this.actualUser[0]?.name || '';
    this.message.avatar = this.actualUser[0]?.avatar || 1;
    this.message.isOwn = true;

    const messageId = await this.messageService.addMessageInFirebase(this.message);
    if (messageId){
      this.message.messageId = messageId;
      console.log('Message created with ID', messageId)
    }
    
    this.message.messageText = '';
    this.scrollToBottom();
  }

  async addConversationMessage(){
      if (this.conversationId && this.newConvMessage.trim() !== '') {
      await this.conversationservice.sendMessage(this.conversationId, this.currentUserId, this.newConvMessage);
      console.log('Success')
      this.newConvMessage = '';
    } else {
      console.log('Etwas fehlt:', this.conversationId, this.newConvMessage)
    }
  }
  
  
}

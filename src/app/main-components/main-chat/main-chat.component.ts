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

@Component({
  selector: 'app-main-chat',
  standalone: true,
  imports: [MessageComponent, CommonModule, FormsModule],
  templateUrl: './main-chat.component.html',
  styleUrls: ['./main-chat.component.scss']
})

export class MainChatComponent {
  allMessages: Message[] = [];
  allThreads: Message[] = [];
  actualUser: User[] = [];
  private allMessageSubscription!: Subscription; 
  private actualUserSubscription!: Subscription;
  @ViewChild('chatFeed') private chatFeed!: ElementRef;
  
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
  static actualUser: any;
  private scrolled = false;

  constructor(private messageService: MessageService, private registerService: RegisterService, private mainservice: MainComponentService) {
  }

  ngOnInit(): void {
    
    this.loadActualUser();
    this.loadMessages();
    setTimeout(() => this.scrollToBottom(), 0);
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

  loadActualUser(){
    this.actualUserSubscription = this.mainservice.acutalUser$.subscribe(actualUser => {
      if (actualUser.length > 0) {
        this.actualUser = actualUser;
        console.log('aktueller User:', this.actualUser);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.allMessageSubscription) {
      this.allMessageSubscription.unsubscribe();
    }
    if (this.actualUserSubscription) {
      this.actualUserSubscription.unsubscribe();
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
  
  
}

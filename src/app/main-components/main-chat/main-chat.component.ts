import { Component, Input } from '@angular/core';
import { MessageComponent } from '../../shared-components/message/message.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../firebase-services/message.service';
import { Message } from '../../interfaces/message.interface';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
import { RegisterService } from '../../firebase-services/register.service';
import { User } from '../../interfaces/user.interface';

@Component({
  selector: 'app-main-chat',
  standalone: true,
  imports: [MessageComponent, CommonModule, FormsModule],
  templateUrl: './main-chat.component.html',
  styleUrls: ['./main-chat.component.scss']
})

export class MainChatComponent {
  allMessages: Message[] = [];
  actualUser: User[] = [];
  private allMessageSubscription!: Subscription; 
  private actualUserSubscription!: Subscription;
  
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
    name: '',
    avatar: 0,
    messageText: '',
    sendAt: `${this.dayString}, ${this.dayNumber} ${this.month}`,
    sendAtTime: `${this.hours}:${this.minutes}`,
    timestamp: Date.now(),
    reaction: 0,
    isOwn: false,
    isThread: false,
    isInThread: false,
    isAnswered: false
  };
  static actualUser: any;

  constructor(private messageService: MessageService, private registerService: RegisterService) {}

  ngOnInit(): void {
    this.loadActualUser();
    this.loadMessages();
  }

  loadMessages() {
    this.allMessageSubscription = this.messageService.allMessages$.subscribe((messages) => {
      this.allMessages = messages;
    });
  }

  loadActualUser(){
    this.actualUserSubscription = this.registerService.acutalUser$.subscribe(actualUser => {
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



  addMessage() {
    this.message.id = this.actualUser[0]?.id || '';
    this.message.name = this.actualUser[0]?.name || '';
    this.message.avatar = this.actualUser[0]?.avatar || 1;
    this.message.isOwn = true;
    
    this.messageService.addMessageInFirebase(
      this.messageService.setMessageObject(this.message, this.message.id),
      this.message.id
    );

    this.message.messageText = '';
  }
  
}




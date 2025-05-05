import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MessageService } from '../../firebase-services/message.service';
import { Message } from '../../interfaces/message.interface';
import { DatePipe } from '@angular/common';
import { MainComponentsComponent } from '../../main-components/main-components.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss',
})
export class MessageComponent {
  @Input() messageData: Message | undefined;
  @Input() date!: Date | string;
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
  

  mainComponents = MainComponentsComponent;
  private allThreadsSubscription!: Subscription; 
  threadAnswers : Message[] = [];


  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    if (this.messageData) {
      this.date = this.messageData.sendAt || this.date;
      this.avatarSrc = this.messageData.avatar || this.avatarSrc;
      this.name = this.messageData.name || this.name;
      this.time = this.messageData.sendAtTime || this.time;
      this.messageText = this.messageData.messageText || this.messageText;
      this.reaction = this.messageData.reaction || this.reaction;
      this.isOwn = this.messageData.isOwn ?? this.isOwn;
      this.isThread = this.messageData.isThread ?? this.isThread;
      this.isInThread = this.messageData.isInThread ?? this.isInThread;
      this.isAnswered = this.messageData.isAnswered ?? this.isAnswered;
      this.threadCount = this.messageData.threadCount || this.threadCount;
      this.threadTo = this.messageData.threadTo ?? this.threadTo;
      const lastAnswer = this.messageService.getLastAnswer(this.messageData);
      if (lastAnswer && lastAnswer.sendAtTime && lastAnswer.sendAt) {
        this.lastAnswerDate = lastAnswer.sendAtTime + ' ' + lastAnswer.sendAt;
      } else {
        this.lastAnswerDate = '';
      }
    }
  }


  onReplyClick(): void {
    if (this.messageData) {
      this.messageService.openThread(this.messageData);
      this.loadThreadAnswers();
    }
  }

  loadThreadAnswers(): void {
      this.allThreadsSubscription = this.messageService.allMessages$.subscribe((messages) => {
      if (this.messageData) {
        this.threadAnswers = messages.filter(message => message.isThread);
        this.threadAnswers = this.messageService.getThreadAnswers(this.messageData.messageId);
        this.messageService.updateThreadAnswers(this.messageData.messageId);
        this.lastAnswerDate = (this.messageService?.lastAnswer?.sendAtTime ?? '') + (this.messageService?.lastAnswer?.sendAt ?? '');
      }
    });
  }

  showEditMessage() {
    let editMessagePopup = document.getElementById('editMessagePopup');
    if (editMessagePopup) {
      editMessagePopup.style.display = 'flex';
    } else {
      console.error('Element with id "editMessagePopup" not found.');
    }
  }

  hideEditMessage() {
    let editMessagePopup = document.getElementById('editMessagePopup');
    if (editMessagePopup) {
      editMessagePopup.style.display = 'hide';
    } else {
      console.error('Element with id "editMessagePopup" not found.');
    }
  }


  addNewReaction(reaction: string) {
    console.log(reaction, this.messageService.messageId);
  }

  ngOnDestroy(): void {
    if (this.allThreadsSubscription) {
      this.allThreadsSubscription.unsubscribe();
    }
  }
}

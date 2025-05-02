import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MessageService } from '../../firebase-services/message.service';
import { Message } from '../../interfaces/message.interface';
import { DatePipe } from '@angular/common';
import { MainComponentsComponent } from '../../main-components/main-components.component';

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

  mainComponents = MainComponentsComponent;

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
    }
  }

  onReplyClick(): void {
    if (this.messageData) {
      this.messageService.openThread(this.messageData);
    }
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
    console.log(reaction);
  }
}

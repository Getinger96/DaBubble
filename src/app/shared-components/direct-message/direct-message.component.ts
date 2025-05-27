import { Component, Input, NgModule } from '@angular/core';
import { MessageComponent } from '../message/message.component';
import { MessageService } from '../../firebase-services/message.service';
import { ConversationMessage } from '../../interfaces/conversation-message.interface';
import { CommonModule } from '@angular/common';
import { MainComponentService } from '../../firebase-services/main-component.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

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

  editMessage: boolean = false;
  showEditPopup: boolean = false;
  
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
    private maincomponentservice: MainComponentService
  ) {}

  ngOnInit(): void {
    if (this.messageData) {
      const timestamp = this.messageData.timestamp;

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

      this.messageText = this.messageData.text || this.messageText;
    }
    console.log('Direct Message:', this.messageData);
  }

ngAfterViewInit(): void {
  if (this.messageData && this.maincomponentservice.actualUser[0]) {
    setTimeout(() => {
      this.isOwn = this.messageData?.senderId === this.maincomponentservice.actualUser[0].id;
    }, 0);
  }
}

  addNewReaction(reaction: string) {
    this.messageservice.saveReaction(reaction);
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

}




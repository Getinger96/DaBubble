import { Component, Input, NgModule } from '@angular/core';
import { MessageComponent } from '../message/message.component';
import { MessageService } from '../../firebase-services/message.service';
import { ConversationMessage } from '../../interfaces/conversation-message.interface';
import { CommonModule } from '@angular/common';
import { MainComponentService } from '../../firebase-services/main-component.service';

@Component({
  selector: 'app-direct-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './direct-message.component.html',
  styleUrl: '../message/message.component.scss'
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

    showEditPopup = MessageComponent.showEditPopup;
    editMessage = MessageComponent.showEditPopup;
  
    dateFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: '2-digit',
  month: 'long'
});

timeFormatter = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
});

  constructor( private messageservice: MessageService, private maincomponentservice: MainComponentService){}

  ngOnInit(): void{
    if (this.messageData) {
      this.date = this.dateFormatter.format(this.messageData.timestamp)  || this.date;
      this.maincomponentservice.currentusermessagAvatar$.subscribe(avatar => {
        if(this.messageData?.senderId === this.maincomponentservice.directmessaeUserIdSubject.value){
            this.avatarSrc = avatar || this.avatarSrc;
        } else {
            this.avatarSrc = this.maincomponentservice.actualUser[0].avatar;
        }
        
      });
      this.maincomponentservice.currentusermessageName$.subscribe(name => {
          if(this.messageData?.senderId === this.maincomponentservice.directmessaeUserIdSubject.value){
            this.name = name || this.name;
        } else {
            this.name = this.maincomponentservice.actualUser[0].name;
        }
      });
      this.time = this.timeFormatter.format(this.messageData.timestamp) || this.time;
      this.messageText = this.messageData.text || this.messageText;
      if (this.messageData.senderId === this.maincomponentservice.actualUser[0].id){
        this.isOwn = true;
      } else {
        this.isOwn = false;
      }
    }
    console.log('Direct Message:',this.messageData);
  }

  addNewReaction(reaction:string){
    this.messageservice.saveReaction(reaction);
  }

  toggleEditPopup(){
    this.messageservice.toggleEditPopup();
  }

  overwriteMessage(){
    this.messageservice.toggleEditPopup();
    MessageComponent.showEditPopup = false;
    MessageComponent.editMessage = true;
  }

  closeEditPopup(){
    MessageComponent.editMessage = false;
    MessageComponent.showEditPopup = false;
  }

}




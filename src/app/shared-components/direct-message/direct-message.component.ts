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
  

  constructor( private messageservice: MessageService, private maincomponentservice: MainComponentService){}

  ngOnInit(): void{
    if (this.messageData) {
      this.date = this.messageData.timestamp || this.date;
      this.maincomponentservice.currentusermessagAvatar$.subscribe(avatar => {
        this.avatarSrc = avatar || this.avatarSrc;
      });
      this.maincomponentservice.currentusermessageName$.subscribe(name => {
        this.name = name || this.name;
      });
      this.time = this.messageData.timestamp || this.time;
      this.messageText = this.messageData.text || this.messageText;
      this.isOwn = this.messageData.isOwn ?? this.isOwn;
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




import { Component } from '@angular/core';
import { MainComponentService } from '../../firebase-services/main-component.service';
import { NgIf,CommonModule } from '@angular/common';
import { UserCardService } from '../active-user/services/user-card.service';
import { MessageService } from '../../firebase-services/message.service';
import { ConversationMessage } from '../../interfaces/conversation-message.interface';
import { DirectMessageComponent } from '../../shared-components/direct-message/direct-message.component';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MainHelperService } from '../../services/main-helper.service';

@Component({
  selector: 'app-direct-message-chat',
  standalone: true,
  imports: [NgIf,CommonModule, FormsModule, DirectMessageComponent],
  templateUrl: './direct-message-chat.component.html',
  styleUrl: './direct-message-chat.component.scss'
})
export class DirectMessageChatComponent {
currentmessageUser:string='';
currentmessageEmail:string='';
currentmessageAvatar:any;
currentmessageStatus:string='';
overlayvisible:boolean=false;
actualUser?:string;
allConversationMessages: ConversationMessage[] = [];
conversationId: string | null = null;
newConvMessage: string = '';
openChannel = this.mainHelperService.openChannel;
showDirectMessage = this.mainservice.showdirectmessage;

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


private allConversationMessageSubscription!: Subscription;


constructor(private mainservice: MainComponentService, public usercardservice: UserCardService, private messageService: MessageService, private mainHelperService: MainHelperService) {

}


  async ngOnInit(): Promise<void>{
    this.loadName();
    this.loadAvatar();
    this.loadEmail();
    this.loadStatus();
    this.actualUser = this.mainservice.actualUser[0].name;
    

    await this.initConversation();
  }

  loadName(){
    this.mainservice.currentusermessageName$.subscribe(name=>{
      this.currentmessageUser = name
    })
  }
  loadEmail(){
    this.mainservice.currentusermessagEmail$.subscribe(email=>{
      this.currentmessageEmail = email;
    })
  }
  loadAvatar(){
    this.mainservice.currentusermessagAvatar$.subscribe(avatar=>{
      this.currentmessageAvatar = avatar;
    })
  }
  loadStatus(){
    this.mainservice.currentusermessagStatus$.subscribe(status=>{
      this.currentmessageStatus = status;
    })
  }

  closeOverlay(){
    this.overlayvisible=false;
  }

  openOverlay(){
    this.overlayvisible=true
  }

  checkConversation(user1: string, user2: string){
    this.messageService.getOrCreateConversation(user1, user2);
  }

  async initConversation():Promise <void> {
    this.allConversationMessages = [];
    this.showDirectMessage = true;
    const currentUserId = this.mainservice.actualUser[0].id;
    const partnerUserId = this.mainservice.directmessaeUserIdSubject.value;
    this.conversationId = await this.messageService.getOrCreateConversation(currentUserId, partnerUserId);
    const initialConvMessages = await this.messageService.getInitialConvMessages(this.conversationId);
    this.allConversationMessages = initialConvMessages;
    this.messageService.listenToMessages(this.conversationId, (liveMessages) => {
    this.allConversationMessages = liveMessages;
  });
}

async addConversationMessage() {
  const currentUserId = this.mainservice.actualUser[0].id;

  if (this.conversationId && this.newConvMessage.trim() !== '') {
    await this.messageService.sendMessage(this.conversationId, currentUserId, this.newConvMessage);
    this.newConvMessage = '';
  } else {
    console.log('Fehlende Daten:', this.conversationId, this.newConvMessage);
  }
}

ngOnDestroy(): void {
  if (this.allConversationMessageSubscription) {
    this.allConversationMessageSubscription.unsubscribe();
  }
}

  loadConversationMessageSender(message:ConversationMessage){
    if(message.isOwn){
      return this.actualUser;
    } else{
      return this.currentmessageUser;
    }
  }

  loadConversationMessageSenderAvatar(message:ConversationMessage){
    if(message.isOwn){
      return this.mainservice.actualUser[0].avatar;
    } else{
      return this.currentmessageAvatar;
    }
  }

}

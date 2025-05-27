import { Component, ElementRef, Output, ViewChild } from '@angular/core';
import { MainComponentService } from '../../firebase-services/main-component.service';
import { NgIf,CommonModule } from '@angular/common';
import { UserCardService } from '../active-user/services/user-card.service';
import { ConversationService } from '../../firebase-services/conversation.service';
import { ConversationMessage } from '../../interfaces/conversation-message.interface';
import { DirectMessageComponent } from '../../shared-components/direct-message/direct-message.component';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MainHelperService } from '../../services/main-helper.service';
import { ProfileCardComponent } from '../profile-card/profile-card.component';
import { ProfileCardOverlayService } from '../profile-card/profile-card-overlay.service';

@Component({
  selector: 'app-direct-message-chat',
  standalone: true,
  imports: [NgIf,CommonModule, FormsModule, DirectMessageComponent, ProfileCardComponent],
  templateUrl: './direct-message-chat.component.html',
  styleUrl: './direct-message-chat.component.scss'
})
export class DirectMessageChatComponent {
@Output() currentmessageUser:string='';
@Output() currentmessageEmail:string='';
@Output() currentmessageAvatar:any;
@Output() currentmessageStatus:string='';
@Output() overlayvisible:boolean = false;
@ViewChild('chatFeed') private chatFeed!: ElementRef;
actualUser?:string;
allConversationMessages: ConversationMessage[] = [];
conversationId: string | null = null;
newConvMessage: string = '';
openChannel = this.mainHelperService.openChannel;
showDirectMessage = this.mainservice.showdirectmessage;
 private scrolled = false;

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

 private unsubscribeFromMessages?: () => void;



  constructor(private mainservice: MainComponentService, public usercardservice: UserCardService, private conversationservice: ConversationService, private mainHelperService: MainHelperService, public profilecardservice: ProfileCardOverlayService) {
    
  }

  async ngOnInit(): Promise<void>{
    this.loadName();
    this.loadAvatar();
    this.loadEmail();
    this.loadStatus();
    setTimeout(() => this.scrollToBottom(), 0);
    this.actualUser = this.mainservice.actualUser[0].name;
    

      // Initiale Konversation laden
  await this.initConversation();

  // Reagiere auf Änderungen des Chat-Partners (z. B. wenn du auf anderen User klickst)
  this.mainservice.directmessaeUserIdSubject.subscribe(async (newPartnerId) => {
    await this.initConversation(); // Lade neue Konversation und Nachrichten
  });
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

  checkConversation(user1: string, user2: string){
    this.conversationservice.getOrCreateConversation(user1, user2);
  }

  async initConversation():Promise <void> {
    if (this.unsubscribeFromMessages) {
      this.unsubscribeFromMessages();
      this.unsubscribeFromMessages = undefined;
    }

    const currentUserId = this.mainservice.actualUser[0].id;
    const partnerUserId = this.mainservice.directmessaeUserIdSubject.value;
    this.conversationId = await this.conversationservice.getOrCreateConversation(currentUserId, partnerUserId);

    this.unsubscribeFromMessages = this.conversationservice.listenToMessages(this.conversationId, (liveMessages) => {
    this.allConversationMessages = liveMessages;
  });
}

  async addConversationMessage() {
    const currentUserId = this.mainservice.actualUser[0].id;

    if (this.conversationId && this.newConvMessage.trim() !== '') {
      await this.conversationservice.sendMessage(this.conversationId, currentUserId, this.newConvMessage);
      this.newConvMessage = '';
    } else {
      console.log('Fehlende Daten:', this.conversationId, this.newConvMessage);
    }
  }

  ngOnDestroy(): void {
    if (this.unsubscribeFromMessages) {
      this.unsubscribeFromMessages();
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

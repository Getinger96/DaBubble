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
 
  
 
  actualUser: User[] = [];
  
 
  @ViewChild('chatFeed') private chatFeed!: ElementRef;
  openChannel = this.mainhelperservice.openChannel;

  
 
  static actualUser: any;
  private scrolled = false;
  actualUserSubscription: Subscription | undefined;
  

  constructor(private mainhelperservice: MainHelperService ,private messageService: MessageService, private registerService: RegisterService, private mainservice: MainComponentService, private conversationservice: ConversationService) {
  }

  async ngOnInit() {
  
    this.loadActualUser();
    

        
   
    

    
  }




  loadActualUser(){
    this.actualUserSubscription = this.mainservice.acutalUser$.subscribe(actualUser => {
      if (actualUser.length > 0) {
        this.actualUser = actualUser;
      }
    });
  }

 
 
  
  
  
}

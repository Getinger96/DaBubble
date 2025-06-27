import { Component, OnInit } from '@angular/core';
import { ChannelService } from '../../firebase-services/channel.service';
import { Channel } from '../../interfaces/channel.interface';
import { CommonModule, NgIf, NgStyle, } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Member } from '../../interfaces/member.interface';
import { Message } from '../../interfaces/message.interface';
import { ConversationMessage } from '../../interfaces/conversation-message.interface';
import { ConversationService } from '../../firebase-services/conversation.service';
import { Conversation } from '../../interfaces/conversation.interface';
import { collection, getDocs } from '@angular/fire/firestore';
import { MessageService } from '../../firebase-services/message.service';
import { MainComponentService } from '../../firebase-services/main-component.service';
import { MainHelperService } from '../../services/main-helper.service';
import { ChannelMessageService } from '../../firebase-services/channel-message.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from '../../interfaces/user.interface';
@Component({
  selector: 'app-new-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-chat.component.html',
  styleUrl: './new-chat.component.scss'
})
export class NewChatComponent implements OnInit {
searchInput: string = '';
private usersSubscription!: Subscription;
private actualUserSubscription!: Subscription;
allUsers: User[] = [];
users: User[] = [];
channels: Channel[] = [];
userId?: string;
actualUser: User[] = [];
  constructor( private channelservice: ChannelService, private mainservice: MainComponentService,
    private mainHelperService: MainHelperService, private channelMessageService: ChannelMessageService, private router: Router, private conversationserice: ConversationService, private messageService: MessageService
  ) {
  }

  async ngOnInit(): Promise<void> {



    this.mainservice.allUsers$.subscribe(users => {
      if (users.length > 0) {
        this.allUsers = users.filter(user => user.email !== 'guest@gmail.com');
        this.users = this.allUsers;  // <-- fülle users mit allUsers
        console.log('Benutzer in der Komponente:', this.allUsers);
      }
    });

     this.channelservice.channels$.subscribe(channels => {
      this.channels = channels;
      console.log('Channels in Component:', this.channels);
    });

        this.loadActualUser();

  }


    loadActualUser() {
    this.actualUserSubscription = this.mainservice.acutalUser$.subscribe(actualUser => {
      if (actualUser.length > 0) {
        this.actualUser = actualUser;
        this.userId = actualUser[0].id; // Hier setzen
        console.log('aktueller User:', this.actualUser);
      }
    });
  }

  searchChannelOrUser() {

  }
}

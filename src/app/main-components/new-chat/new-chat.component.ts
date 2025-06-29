import { Component, OnInit, Output, EventEmitter } from '@angular/core';
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
currentChannelName: string = '';
currentChannelID: string = '';
allUsers: User[] = [];
users: User[] = [];
channels: Channel[] = [];
filteredChannels: Channel[] = [];
filteredUsers: User[] =[]
selectedChannel: Channel | null = null;
selectedUser: User[] | null = null;
userId?: string;
selectedReceiver: string | null = null;
@Output() toggleOpenNewChatToMainCompoment = new EventEmitter<void>();
actualUser: User[] = [];
months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
days = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
d = new Date();
dayName = this.d.toLocaleString('de-DE', { weekday: 'long' });
monthName = this.d.toLocaleString('de-DE', { month: 'long' });
dayNumber = this.d.getDate();
hours = this.d.getHours().toString().padStart(2, '0');
minutes = this.d.getMinutes().toString().padStart(2, '0');
message: Message = {
    id: '',
    messageId: '',
    channelId: this.currentChannelID,
    channelName: this.currentChannelName,
    name: '',
    avatar: 0,
    messageText: '',
    sendAt: `${this.dayName}, ${this.dayNumber}. ${this.monthName}`,
    sendAtTime: `${this.hours}:${this.minutes}`,
    timestamp: Date.now(),
    reaction: 0,
    isOwn: false,
    isThread: false,
    isInThread: false,
    isAnswered: false,
    threadTo: '',
    threadCount: 0,
  };



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
   const term = this.searchInput.toLowerCase().trim();
   this.filteredChannels = []
   this.filteredUsers = []
      if (term.startsWith('@')) {
      const userTerm = term.slice(1);
      this.filterUser(userTerm)
     } else if (term.startsWith('#')) {
       this.fiterChannel(term)
   }else {
      this.filterUser(term)
  }
       
}

fiterChannel(term:string) {
   const channelTerm = term.slice(1);
   this.filteredChannels = this.channels.filter(channel =>
   channel.name.toLowerCase().includes(channelTerm) && 
    channel.members.some(member => member.name === this.actualUser[0].name)
  );
   }


   filterUser(term:string) {
        this.filteredUsers = this.allUsers.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
             );
   }


   selectChannel(channel: any) {
  this.selectedReceiver = '#' + channel.name;
  this.searchInput = '';
  this.selectedChannel = channel;
  this.selectedUser = null;
  console.log('channel', channel);
}

addMessageInChannel(channel:any, channelId:string, channelName: string) {
   if (!channelId || !channelName) return;

    this.message.channelId = channelId;
    this.message.channelName = channelName;
    this.message.id = this.actualUser[0]?.id || '';
    this.message.name = this.actualUser[0]?.name || '';
    this.message.avatar = this.actualUser[0]?.avatar || 1;
    this.message.isOwn = true;

    this.channelMessageService.addMessage(this.message, channelId, channelName);
    this.message.messageText = '';
    this.openChannel(true, channel.name, channel.description,channel.creator,channel.id, channel.members,channel.date )
  
}



  openChannel(isOpen: boolean, name: string, description: string, creator: string, id: string, members: Member[], date: string) {
    this.mainHelperService.openChannelSection(isOpen);
    this.channelservice.setChannelName(name);
    this.channelservice.setChannelDescription(description);
    this.channelservice.setChannelcreator(creator);
    this.channelservice.setChannelId(id)
    this.channelservice.setChannelMember(members);
    this.channelservice.setChanneldate(date)
    this.mainservice.showdirectmessage = false
    this.userId = this.actualUser[0].id;
    this.mainHelperService.openNewChat =false
    this.router.navigateByUrl(`/main-components/${this.userId}/channel/${id}`);
    this.channelMessageService.getChannelId(id)
       if (window.matchMedia('(max-width: 768px)').matches) {
      this.toggleToMainCompoments();
    }

  }

toggleToMainCompoments() {
this.toggleOpenNewChatToMainCompoment.emit();
}



saveMessage() {
  if (this.selectedChannel) {
    this.addMessageInChannel(
      this.selectedChannel,
      this.selectedChannel.id,
      this.selectedChannel.name
    );
  } else if (this.selectedUser) {
    this.sendDirectMessageToUser(this.selectedUser);
  } else {
    console.warn('Kein Empfänger ausgewählt');
  }
}

sendDirectMessageToUser(selectedUser: User[]) {
  if (selectedUser) {
    
  }

}



selectUser(user: any) {
this.selectedReceiver = '@' + user.name;
  this.searchInput = '';
  this.selectedUser = user;
  this.selectedChannel = null; 
  console.log('user', user);
}

}
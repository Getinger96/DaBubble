import { Component, OnInit, Output, EventEmitter,HostListener,ElementRef,ViewChild, inject} from '@angular/core';
import { ChannelService } from '../../firebase-services/channel.service';
import { Channel } from '../../interfaces/channel.interface';
import { CommonModule, NgIf, NgStyle, } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Member } from '../../interfaces/member.interface';
import { Message } from '../../interfaces/message.interface';
import { ConversationMessage } from '../../interfaces/conversation-message.interface';
import { ConversationService } from '../../firebase-services/conversation.service';
import { Conversation } from '../../interfaces/conversation.interface';
import { addDoc, collection, doc, getDocs, Firestore, onSnapshot, updateDoc, DocumentReference, getDoc, deleteDoc, serverTimestamp } from '@angular/fire/firestore';
import { MessageService } from '../../firebase-services/message.service';
import { MainComponentService } from '../../firebase-services/main-component.service';
import { MainHelperService } from '../../services/main-helper.service';
import { ChannelMessageService } from '../../firebase-services/channel-message.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from '../../interfaces/user.interface';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { AddUserInNewChatComponent } from './add-user-in-new-chat/add-user-in-new-chat.component';

@Component({
  selector: 'app-new-chat',
  standalone: true,
  imports: [CommonModule, FormsModule,PickerComponent, AddUserInNewChatComponent],
  templateUrl: './new-chat.component.html',
  styleUrl: './new-chat.component.scss'
})
export class NewChatComponent implements OnInit {
firestore: Firestore = inject(Firestore);  
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
selectedUser: User | null = null;
userId?: string;
conversationId?:string;
toggleEmoji: boolean = false
toggleUserInChat:boolean =false
showSearchBar: boolean = false
selectedReceiver: string | null = null;
@Output() toggleOpenNewChatToMainCompoment = new EventEmitter<void>();
@ViewChild('emojiImg') emojiImg!: ElementRef<HTMLTextAreaElement>
@ViewChild('emojiComponent') emojiComponent!: ElementRef<HTMLTextAreaElement>
@ViewChild('inputFieldSearchbar') inputFieldSearchbar!: ElementRef<HTMLTextAreaElement>
@ViewChild('searchList') searchList!: ElementRef<HTMLTextAreaElement>
@ViewChild('addUserCompoment') addUserCompoment!: ElementRef<HTMLTextAreaElement>
@ViewChild('atImg') atImg!: ElementRef<HTMLTextAreaElement>
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



    @HostListener('document:click', ['$event'])
    handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
  
      const clickedInsideEmoji = this.emojiComponent?.nativeElement?.contains(target)
        || this.emojiImg.nativeElement?.contains(target);

    const clickedInsideSearchBar =
  (this.inputFieldSearchbar?.nativeElement && this.inputFieldSearchbar.nativeElement.contains(target)) ||
  (this.searchList?.nativeElement && this.searchList.nativeElement.contains(target));


      const clickedInsideAtAddMember = this.addUserCompoment?.nativeElement?.contains(target)
      || this.atImg.nativeElement?.contains(target);
  
      if (!clickedInsideEmoji) {
        this.toggleEmoji = false;
      }
  
         if (!clickedInsideSearchBar) {
        this.showSearchBar = false;
      }

            if (!clickedInsideAtAddMember) {
        this.toggleUserInChat = false;
      }
  
    }


  
  addEmoji(event: any) {
    const emoji = event.emoji.native;
    console.log('emoji', emoji);

    this.message.messageText += emoji;
    
  }


  insertUserIntoTextarea(user:User) {
    this.selectedReceiver = '@' + user.name;
    this.searchInput = '';
    this.selectedUser = user;
    this.selectedChannel = null; 
    console.log('user', user);
    this.toggleUserInChat =false

  }

    openDialogAddMember() {

    this.toggleUserInChat = !this.toggleUserInChat;
    if (this.toggleEmoji) {
      this.toggleEmoji = false
    }
  }


  toggleEmojiBar() {
    this.toggleEmoji = !this.toggleEmoji;
  
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
  this.showSearchBar = true
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


selectUser(user: any) {
this.selectedReceiver = '@' + user.name;
  this.searchInput = '';
  this.selectedUser = user;
  this.selectedChannel = null; 
  console.log('user', user);
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
   this.addMessageInGeneralchannel()
  }
}

async sendDirectMessageToUser(selectedUser: User) {
  if (selectedUser && this.userId && selectedUser.id ) {
      this.conversationId = await this.conversationserice.getOrCreateConversation(this.userId!, selectedUser.id  );
      this.addConversationMessage(this.conversationId,selectedUser )
  }

}



async addMessageInGeneralchannel() {
  const generalChannelId  = "BLDNqmQQWm4Qqv4NLNbv"
  const generalChannelName = "Allgemein"
  const generalChannelDescription = "Das ist ein Allgemeiner Channel"
  const generalChannelCreator = "Erich Getinger"
  const generalChannelDate = "2025-06-17T20:27:33.152Z"
  const generalChannelMembers = await this.getMemberList(generalChannelId);


    this.message.channelId = generalChannelId;
    this.message.channelName = generalChannelName;
    this.message.id = this.actualUser[0]?.id || '';
    this.message.name = this.actualUser[0]?.name || '';
    this.message.avatar = this.actualUser[0]?.avatar || 1;
    this.message.isOwn = true;

    this.channelMessageService.addMessage(this.message, generalChannelId, generalChannelName);
    this.message.messageText = '';
    this.openChannel(true, generalChannelName, generalChannelDescription,generalChannelCreator,generalChannelId, generalChannelMembers, generalChannelDate )

}


async getMemberList(generalChannelId:string) {
  const channelDocRef = doc(this.firestore, 'Channels', generalChannelId);
  const channelDocSnap = await getDoc(channelDocRef);

    if (channelDocSnap.exists()) {
    const data = channelDocSnap.data();
    const members = data['members']; 
    return members;

}

}
 opendirectChat(id: string,name: string, close: boolean, avatar: number, email: string, status: string) {

       if (!this.actualUser || this.actualUser.length === 0) {
      console.warn('actualUser not loaded yet');
      return;
    }
   this.mainservice.showmainchat=false
    this.mainservice.showdirectmessage = true
    this.mainHelperService.openChannelSection(close)
    this.mainservice.setDirectmessageuserName(name)
    this.mainservice.setDirectmessageuserEmail(email)
    this.mainservice.setDirectmessageuserAvatar(avatar)
    this.mainservice.setDirectmessageuserStatus(status)
    this.mainservice.setDirectmessageuserId(id)
    this.router.navigate(['/main-components/' + this.actualUser[0].id+'/directmessage/'+ id], { replaceUrl: true })
    this.mainHelperService.openNewChat =false;
    console.log(this.actualUser[0].id, this.mainservice.directmessaeUserIdSubject.value )

 
    
  }

async addConversationMessage(conversationId:string,selectedUser: User) { 
    const currentUserId = this.mainservice.actualUser[0].id;
    const currentUserName = this.mainservice.actualUser[0].name;
    const currentUserAvatar = this.mainservice.actualUser[0].avatar;

    if (conversationId && this.message.messageText.trim() !== '') {
      await this.conversationserice.sendMessage(conversationId, currentUserId, this.message.messageText, currentUserName, currentUserAvatar);
      this.message.messageText = '';
    } else {
      console.log('Fehlende Daten:', this.conversationId, this.message.messageText);
    }

    this.opendirectChat(selectedUser.id, selectedUser.name, false, selectedUser.avatar, selectedUser.email, selectedUser.status  )

}



}
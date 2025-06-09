import { Component, Input } from '@angular/core';
import { RegisterService } from '../../firebase-services/register.service';
import { ChannelService } from '../../firebase-services/channel.service';
import { MainComponentService } from '../../firebase-services/main-component.service';
import { MainHelperService } from '../../services/main-helper.service';
import { ChannelMessageService } from '../../firebase-services/channel-message.service';
import { Router } from '@angular/router';
import { User } from '../../interfaces/user.interface';
import { Subscription } from 'rxjs';
import { Channel } from '../../interfaces/channel.interface';
import { CommonModule, NgIf, } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Member } from '../../interfaces/member.interface';
import { Message } from '../../interfaces/message.interface';
import { ConversationMessage } from '../../interfaces/conversation-message.interface';
import { ConversationService } from '../../firebase-services/conversation.service';
import { Conversation } from '../../interfaces/conversation.interface';
import { collection, getDocs } from '@angular/fire/firestore';


@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss'
})
export class SearchBarComponent {
  private usersSubscription!: Subscription;
  placeholderSearchBar: string = "Devspace durchsuchen";
  allUsers: User[] = [];
  channels: Channel[] = [];
  allMessages: ConversationMessage[] = []
  searchTerm: string = '';
  filteredUsers: User[] = [];
  filteredChannels: Channel[] = [];
  userId?: string
  private actualUserSubscription!: Subscription;
  actualUser: User[] = [];
  channelMessages: Message[] = [];
  filteredMessages: Message[] = [];
  directMessages: ConversationMessage[] = [];
  filteredDirectMessages: any[] = []
  users: User[] = [];
  conversations: Conversation[] = []



  constructor(private registerservice: RegisterService, private channelservice: ChannelService, private mainservice: MainComponentService,
    private mainHelperService: MainHelperService, private channelMessageService: ChannelMessageService, private router: Router, private conversationserice: ConversationService
  ) {


  }


  async ngOnInit(): Promise<void> {



    this.usersSubscription = this.mainservice.allUsers$.subscribe(users => {
      if (users.length > 0) {
        this.allUsers = users.filter(user => user.email !== 'guest@gmail.com');
        this.users = this.allUsers;  // <-- fülle users mit allUsers
        console.log('Benutzer in der Komponente:', this.allUsers);
      }
    });

    // Channels laden
    this.channelservice.channels$.subscribe(channels => {
      this.channels = channels;
      console.log('Channels in Component:', this.channels);
    });


    this.loadActualUser();

    this.channelMessageService.loadAllMessagesFromAllChannels();
    this.channelMessageService.allMessages$.subscribe(messages => {
      this.channelMessages = messages;
    });

    this.conversationserice.loadAllDirectMessages();
    this.conversationserice.allMessages$.subscribe(messages => {
      this.directMessages = messages;
    });
    const convRef = collection(this.conversationserice.firestore, 'conversation');
    const snapshot = await getDocs(convRef);
    this.conversations = snapshot.docs.map(docSnap => new Conversation(docSnap.data()));

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

  filterResults() {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredUsers = [];
    this.filteredChannels = [];
    this.filteredMessages = [];
    this.filteredDirectMessages = [];

    if (!term) return;

    if (term.startsWith('@')) {
      const userTerm = term.slice(1);
      this.filteredUsers = this.allUsers.filter(user =>
        user.name.toLowerCase().includes(userTerm) ||
        user.email.toLowerCase().includes(userTerm)
      );
    } else if (term.startsWith('#')) {
      const channelTerm = term.slice(1);
      this.filteredChannels = this.channels.filter(channel =>
        channel.name.toLowerCase().includes(channelTerm)
      );
    } else {
      this.filteredUsers = this.allUsers.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );

      this.filteredChannels = this.channels.filter(channel =>
        channel.name.toLowerCase().includes(term)
      );

      this.filteredMessages = this.channelMessages.filter(msg =>
        msg.messageText?.toLowerCase().includes(term)
      );

      this.filteredDirectMessages = this.directMessages.filter(msg =>
        msg.text?.toLowerCase().includes(term)
      );
    }
    console.log('this.filteredDirectMessages', this.filteredDirectMessages);
  }


  // Load all messages in conversation
  loadAllMessageInConversation() {
    this.conversationserice.allMessages$.subscribe((messages) => {
      this.allMessages = messages;
    });
    console.log('this.allMessages', this.allMessages);

  }

  openDirectMessageChat(dm: ConversationMessage, close: boolean) {
    this.mainservice.showdirectmessage = true
    this.mainHelperService.openChannelSection(close)
    this.mainservice.setDirectmessageuserName(dm.name)
    this.mainservice.setDirectmessageuserId(dm.senderId)
    this.mainservice.directmessaeUserIdSubject.next(dm.name);
    this.searchTerm = '';
    this.router.navigateByUrl(`/main-components/${this.userId}/directmessage/${dm.conversationmessageId}`);
  }



navigateToDirectMessage(dm: ConversationMessage) {
  if (!this.userId) return;

  // Finde die passende Conversation
  const conversation = this.conversations.find(conv =>
    conv.id?.includes(dm.id)
  );

  if (!conversation) {
    console.warn('Keine passende Konversation gefunden');
    return;
  }

  // Versuche den anderen Nutzer zu finden, oder nimm dich selbst
  let otherUserId = conversation.users.find(uid => uid !== this.userId);

  if (!otherUserId) {
    // Wenn kein anderer gefunden wurde, handelt es sich wohl um eine Selbst-Notiz
    otherUserId = this.userId;
  }

  const user = this.allUsers.find(u => u.id === otherUserId);

  if (!user) {
    console.warn('User zu Direktnachricht nicht gefunden');
    return;
  }

  this.opendirectmessage(
    user.id!,
    user.name,
    false,
    user.avatar,
    user.email,
    user.status
  );
}

opendirectmessage(id: string, name: string, close: boolean, avatar: number, email: string, status: string) {
  this.mainservice.showdirectmessage = true
  this.mainHelperService.openChannelSection(close)
  this.mainservice.setDirectmessageuserName(name)
  this.mainservice.setDirectmessageuserEmail(email)
  this.mainservice.setDirectmessageuserAvatar(avatar)
  this.mainservice.setDirectmessageuserStatus(status)
  this.mainservice.setDirectmessageuserId(id)
  this.mainservice.directmessaeUserIdSubject.next(id);
  this.searchTerm = '';
  this.router.navigateByUrl(`/main-components/${this.userId}/directmessage/${id}`);

}


openChannel(isOpen: boolean, name: string, description: string, creator: string, id: string, members: Member[], date: string) {
  this.mainHelperService.openChannelSection(isOpen);
  this.channelservice.setChannelName(name);
  this.channelservice.setChannelDescription(description);
  this.channelservice.setChannelcreator(creator);
  this.channelservice.setChannelId(id)
  this.channelservice.setChannelMember(members);
  this.channelservice.setChanneldate(date)
  this.mainservice.showdirectmessage = false;
  this.userId = this.actualUser[0].id;
  this.router.navigateByUrl(`/main-components/${this.userId}/channel/${id}`);
  this.channelMessageService.getChannelId(id)
  this.searchTerm = '';
}

navigateToMessage(message: Message) {
  const userId = this.actualUser[0]?.id;
  if (!userId) return;

  this.searchTerm = '';

  const channel = this.channels.find(c => c.id === message.channelId);
  if (!channel) return;

  this.openChannel(
    true,
    channel.name,
    channel.description,
    channel.creator,
    channel.id,
    channel.members,
    channel.date
  );

  // Thread öffnen, falls nötig
  if (message.isThread && message.threadTo) {
    const originalMessage = this.channelMessageService.allMessages.find(msg => msg.messageId === message.threadTo);
    if (originalMessage) {
      this.channelMessageService.openThread(originalMessage);
    }
  } else if (message.isInThread) {
    this.channelMessageService.openThread(message);
  }
}

}

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
  searchTerm: string = '';
  filteredUsers: User[] = [];
  filteredChannels: Channel[] = [];
  userId?: string
  private actualUserSubscription!: Subscription;
  actualUser: User[] = [];
  channelMessages: Message[] = [];
  filteredMessages: Message[] = [];



  constructor(private registerservice: RegisterService, private channelservice: ChannelService, private mainservice: MainComponentService,
    private mainHelperService: MainHelperService, private channelMessageService: ChannelMessageService, private router: Router
  ) {

  }


  ngOnInit(): void {
    this.usersSubscription = this.mainservice.allUsers$.subscribe(users => {
      if (users.length > 0) {
        this.allUsers = users.filter(user => user.email !== 'guest@gmail.com');

        console.log('Benutzer in der Komponente:', this.allUsers);
      }
    });
    this.channelservice.channels$.subscribe(channels => {
      this.channels = channels;
      console.log('Channels in Component:', this.channels);
    });
    this.loadActualUser()
    this.channelMessageService.loadAllMessagesFromAllChannels(); // <--- NEU
  this.channelMessageService.allMessages$.subscribe(messages => {
    this.channelMessages = messages;
  });
  }
  loadActualUser() {
    this.actualUserSubscription = this.mainservice.acutalUser$.subscribe(actualUser => {
      if (actualUser.length > 0) {
        this.actualUser = actualUser;
        console.log('aktueller User:', this.actualUser);
      }
    });


  }

  filterResults() {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredUsers = [];
    this.filteredChannels = [];
    this.filteredMessages = [];

    if (!term) {
      return;
    }

    if (term.startsWith('@')) {
      const userTerm = term.slice(1); // Entfernt das '@'
      this.filteredUsers = this.allUsers.filter(user =>
        user.name.toLowerCase().includes(userTerm) ||
        user.email.toLowerCase().includes(userTerm)
      );
    } else if (term.startsWith('#')) {
      const channelTerm = term.slice(1); // Entfernt das '#'
      this.filteredChannels = this.channels.filter(channel =>
        channel.name.toLowerCase().includes(channelTerm)
      );
    } else {
      // Filtert Benutzer
      this.filteredUsers = this.allUsers.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );

      // Filtert Channels
      this.filteredChannels = this.channels.filter(channel =>
        channel.name.toLowerCase().includes(term)
      );

      // Filtert Nachrichten
      this.filteredMessages = this.channelMessages.filter(msg =>
        msg.messageText?.toLowerCase().includes(term)
      );
    }
  }
  opendirectmessage(id: string, name: string, close: boolean, avatar: number, email: string, status: string) {
    this.mainservice.showdirectmessage = true
    this.mainHelperService.openChannelSection(close)
    this.mainservice.setDirectmessageuserName(name)
    this.mainservice.setDirectmessageuserEmail(email)
    this.mainservice.setDirectmessageuserAvatar(avatar)
    this.mainservice.setDirectmessageuserStatus(status)
    this.mainservice.setDirectmessageuserId(id)
    this.searchTerm = '';
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
  this.channelservice.setChannelId(message.channelId);

  this.router.navigateByUrl(`/main-components/${this.actualUser[0]?.id}/channel/${message.channelId}`).then(() => {
    // Wenn es eine Thread-Antwort ist, hole die Ursprungsnachricht (threadTo) und öffne diesen Thread
    if (message.isThread && message.threadTo) {
      const originalMessage = this.channelMessageService.allMessages.find(msg => msg.messageId === message.threadTo);
      if (originalMessage) {
        this.channelMessageService.openThread(originalMessage);
      }
    }

    // Wenn es selbst ein Thread-Starter ist, öffne den Thread direkt
    else if (message.isInThread) {
      this.channelMessageService.openThread(message);
    }
  });

  this.searchTerm = '';
}
}

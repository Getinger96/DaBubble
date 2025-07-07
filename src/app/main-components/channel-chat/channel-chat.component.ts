import { Component, OnInit, inject, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ChannelService } from '../../firebase-services/channel.service';
import { MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle, } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ShowUserComponent } from './show-user/show-user.component';
import { AddUserComponent } from './add-user/add-user.component';
import { AddMemberChannelComponent } from './add-member-channel/add-member-channel.component';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { Channel } from '../../interfaces/channel.interface';
import { User } from '../../interfaces/user.interface';
import { Member } from '../../interfaces/member.interface';
import { NgZone } from '@angular/core';
import { ChannelMessageService } from '../../firebase-services/channel-message.service';
import { Message } from '../../interfaces/message.interface';
import { Subscription } from 'rxjs';
import { MainComponentService } from '../../firebase-services/main-component.service';
import { Router, NavigationStart, RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MainHelperService } from '../../services/main-helper.service';
import { ConversationService } from '../../firebase-services/conversation.service';
import { ConversationMessage } from '../../interfaces/conversation-message.interface';
import { DirectMessageComponent } from '../../shared-components/direct-message/direct-message.component';
import { MessageComponent } from '../../shared-components/message/message.component';
import { MessageService } from '../../firebase-services/message.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { ResponsivService } from '../../services/responsiv.service';


@Component({
  selector: 'app-channel-chat',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, NgIf, CommonModule, FormsModule, RouterModule, MessageComponent, PickerComponent, AddMemberChannelComponent],
  templateUrl: './channel-chat.component.html',
  styleUrl: './channel-chat.component.scss'
})
export class ChannelChatComponent implements OnInit {
  currentChannelName: string = '';
  currentChannelDescription: string = '';
  currentChannelCreator: string = '';
  currentChannelID: string = '';
  currentChannelDate: string = '';
  actualUser: User[] = [];
  private actualUserSubscription!: Subscription;
  private allMessageSubscription!: Subscription;
  private allConversationMessageSubscription!: Subscription;
  private usersSubscription!: Subscription;
  @ViewChild('messageBox') messageBox!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('addMemberComponent') addMemberComponent!: ElementRef<HTMLTextAreaElement>
  @ViewChild('atImg') atImg!: ElementRef<HTMLTextAreaElement>
  @ViewChild('emojiImg') emojiImg!: ElementRef<HTMLTextAreaElement>
  @ViewChild('emojiComponent') emojiComponent!: ElementRef<HTMLTextAreaElement>
  @ViewChild('nameInputField') nameInputField!: ElementRef<HTMLInputElement>;
  @ViewChild('descriptionInputField') descriptionInputField!: ElementRef<HTMLInputElement>;
  @ViewChild('channelInfo') channelInfo!: ElementRef<HTMLDivElement>;
  members: Member[] = [];
  @Input() allUsersChannel: User[] = [];
  allUsers: User[] = [];
  allMessages: Message[] = [];
  allThreads: Message[] = [];
  channels: Channel[] = [];
  readonly dialog = inject(MatDialog);
  overlayeditChannel: boolean = false;
  editName: boolean = false
  editDescription: boolean = false
  textInput: Message[] = [];
  toggleMemberInChat: boolean = false;
  months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  days = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
  d = new Date();
  dayName = this.d.toLocaleString('de-DE', { weekday: 'long' });
  monthName = this.d.toLocaleString('de-DE', { month: 'long' });
  dayNumber = this.d.getDate();
  hours = this.d.getHours().toString().padStart(2, '0');
  minutes = this.d.getMinutes().toString().padStart(2, '0');
  channelId!: string;
  toggleEmoji: boolean = false
  openChannel = this.mainhelperservice.openChannel;
  allConversationMessages: ConversationMessage[] = [];

  showChannelList: boolean = false;
  isChannelInfoVisible = false;
  shouldFocusMessageBox = false;
  
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



  constructor(private channelService: ChannelService, private ngZone: NgZone, private channelmessageService: ChannelMessageService, private mainservice: MainComponentService,
    private route: ActivatedRoute, public mainhelperservice: MainHelperService, private conversationservice: ConversationService, private messageService: MessageService,
    private _eref: ElementRef, public responsiveService: ResponsivService) {

    }



  ngOnInit(): void {
    this.mainservice.showmainchat=false
    this.loadRouter();
    this.loadActualUser();
    this.loadAllUser();
    this.mainhelperservice.focusChannelMessage$.subscribe(() => {
      this.shouldFocusMessageBox = true;
    });
    this.loadAllChannelNames();
  }

loadAllChannelNames() {
    console.log('Channels in Component:', this.mainhelperservice.channelNames);
}


ngAfterViewChecked() {
  if (this.shouldFocusMessageBox && this.messageBox) {
    this.messageBox.nativeElement.focus();
    this.shouldFocusMessageBox = false;
  }
}



  openQuickMenu() {
    const text = this.message.messageText;
    if (text.endsWith('@')) {
      this.toggleMemberInChat = true;
      this.showChannelList = false;
    } else if (text.endsWith('#')) {
      this.showChannelList = true;
      this.toggleMemberInChat = false;
      console.log('#');
    } else {
      this.toggleMemberInChat = false;
      this.showChannelList = false;
    }
  }


  loadAllUser() {
    this.usersSubscription = this.mainservice.allUsers$.subscribe(users => {
      if (users.length > 0) {
        this.allUsers = users.filter(user => user.email !== 'guest@gmail.com');

        console.log('Benutzer in der Komponente:', this.allUsers);
      }
    });
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    const clickedInsideAtAddMember = this.addMemberComponent?.nativeElement?.contains(target)
      || this.atImg.nativeElement?.contains(target);

    const clickedInsideEmoji = this.emojiComponent?.nativeElement?.contains(target)
      || this.emojiImg.nativeElement?.contains(target);

    if (!clickedInsideAtAddMember) {
      this.toggleMemberInChat = false;
    }

    if (!clickedInsideEmoji) {
      this.toggleEmoji = false;
    }

  }

  toggleChannelInfo() {
    this.isChannelInfoVisible = !this.isChannelInfoVisible;
  }

  toggleEmojiBar() {
    this.toggleEmoji = !this.toggleEmoji;
    if (this.toggleMemberInChat) {
      this.toggleMemberInChat = false
    }
  }



  openDialogAddMember() {
    this.toggleMemberInChat = !this.toggleMemberInChat;
    if (this.toggleEmoji) {
      this.toggleEmoji = false
    }
  }




  loadActualUser() {
    this.actualUserSubscription = this.mainservice.acutalUser$.subscribe(actualUser => {
      if (actualUser.length > 0) {
        this.actualUser = actualUser;
        console.log('aktueller User:', this.actualUser);
      }
    });
  }


  loadRouter() {
    this.route.paramMap.subscribe(params => {
      const channelId = params.get('channelId');
      if (channelId) {
        this.channelId = channelId;
        console.log('🎯 Aktive channelId:', channelId);

        this.channelService.setCurrentChannel(channelId);

        // Jetzt, wo wir die channelId haben, können wir laden:
        this.loadMessages(channelId);
        this.loadName();
        this.loadDescription();
        this.loadChannelId();
        this.loadCurrentCrator();
        this.loadMembers();
        this.loadDate();

      }
    });
  }

  loadChannelId() {
    this.channelService.currentChannelId$.subscribe(id => {
      this.currentChannelID = id;
    });
  }

  loadCurrentCrator() {
    this.channelService.currentChannelCreator$.subscribe(creator => {
      this.currentChannelCreator = creator;
    });
  }

  loadName() {
    this.channelService.currentChannelName$.subscribe(name => {
      this.currentChannelName = name;
      console.log(this.currentChannelName);

    });
  }


  loadDescription() {
    this.channelService.currentChannelDescription$.subscribe(description => {
      this.currentChannelDescription = description;
    });
  }


  loadMembers() {
    this.channelService.channelMember$.subscribe(members => {
      this.members = members;
      console.log('this.members', this.members);

    });
  }

  loadDate() {
    this.channelService.currentChannelDate$.subscribe(date => {
      this.currentChannelDate = date;
    })
  }
  loadMessages(channelId: string) {
  console.log('📥 Nachrichten werden geladen für Channel:', channelId);

  if (this.allMessageSubscription) {
    this.allMessageSubscription.unsubscribe();
  }

  this.channelmessageService.subList(channelId);

  this.allMessageSubscription = this.channelmessageService.allMessages$.subscribe((messages) => {
    console.log('📦 Alle geladenen Nachrichten aus dem Service:', messages);

    const filtered = messages.filter(message => !!message.messageText?.trim());
    this.allMessages = filtered
  .filter(message => !message.isThread && message.channelId === channelId)
  .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0)); // ⬅ Sortierung nach Zeit

this.allThreads = filtered
  .filter(message => message.isThread && message.channelId === channelId)
  .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0)); // optional
    console.log('✅ Gefilterte Nachrichten für diesen Channel:', this.allMessages);
  });
}


  addEmoji(event: any) {
    const emoji = event.emoji.native;
    console.log('emoji', emoji);
    this.message.messageText += emoji;
  }



  startEditName() {
    this.editName = true
    setTimeout(() => {
    this.nameInputField.nativeElement.focus();
  });
  }

  saveName() {
    this.editName = false
  }

  startEditDescription() {
    this.editDescription = true
    setTimeout(() => {
    this.descriptionInputField.nativeElement.focus();
  });
  }

  saveDescription() {
    this.editDescription = false
  }

  openDialog() {
    const dialogRef = this.dialog.open(ShowUserComponent, {
      data: {
        allUsersChannel: this.allUsersChannel,
        members: this.members,
      },
      panelClass: 'another-dialog-position'
    });

    dialogRef.componentInstance.addMemberClicked.subscribe(() => {

      setTimeout(() => {
        this.openDialogMembers();
      }, 50);
    });
  }

  openDialogMembers() {
    const dialogRef = this.dialog.open(AddUserComponent, {
      data: {
        allUsers: this.allUsers,
        members: this.members,
        currentChannelID: this.currentChannelID,
        currentChannelName: this.currentChannelName
      },
      panelClass: 'another-dialog-position'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      this.ngZone.run(() => {
        this.loadMembers();
      });
    });
  }


  insertMemberIntoTextarea(member: Member) {
    const text = this.message.messageText;
    let insertText = `@${member.name} `;
    if (text.startsWith('@')) {
      insertText = member.name + ' ';
    }
    this.message.messageText += insertText;
  }


  closeOverlay() {
    this.overlayeditChannel = false;
  }

  openoverlay() {
    this.overlayeditChannel = true;
  }

  onDialogClick(event: MouseEvent) {
    event.stopPropagation();
  }

  updateChannel(event: Event, ngForm: NgForm, id: string) {

    this.channelService.updateChannel(this.currentChannelID, this.currentChannelName, this.currentChannelDescription)

    this.closeOverlay()
  }

  deleteChannel() {
    this.channelService.deleteChannel(this.currentChannelID)
    this.closeOverlay()
  }

  sendmessage() {
    if (!this.currentChannelID || !this.currentChannelName) return;

    this.message.channelId = this.currentChannelID;
    this.message.channelName = this.currentChannelName;
    this.message.id = this.actualUser[0]?.id || '';
    this.message.name = this.actualUser[0]?.name || '';
    this.message.avatar = this.actualUser[0]?.avatar || 1;
    this.message.isOwn = true;

    this.channelmessageService.addMessage(this.message, this.currentChannelID, this.currentChannelName);
    this.message.messageText = '';
  }

  toggleMemberInChannel() {
    this.mainhelperservice.showMemberList = !this.mainhelperservice.showMemberList
  }


}





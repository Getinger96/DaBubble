import { Component, OnInit, inject, Input } from '@angular/core';
import { ChannelService } from '../../firebase-services/channel.service';
import { MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle, } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ShowUserComponent } from './show-user/show-user.component';
import { AddUserComponent } from './add-user/add-user.component';
import { MatIconModule } from '@angular/material/icon';
import { HostListener } from '@angular/core';
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
@Component({
  selector: 'app-channel-chat',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, NgIf, CommonModule, FormsModule, RouterModule, MessageComponent, PickerComponent],
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

  members: Member[] = [];
  @Input() allUsersChannel: User[] = [];
  allMessages: Message[] = [];
  allThreads: Message[] = [];
  readonly dialog = inject(MatDialog);
  overlayeditChannel: boolean = false;
  editName: boolean = false
  editDescription: boolean = false
  textInput: Message[] = [];
  months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  days = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
  d = new Date();
  month = this.months[this.d.getMonth()];
  dayString = this.days[this.d.getDay()];
  dayNumber = this.d.getDate();
  minutes = this.d.getMinutes();
  hours = this.d.getHours();
  channelId!: string;
  openChannel = this.mainhelperservice.openChannel;
  allConversationMessages: ConversationMessage[] = [];
  toggleEmoji: boolean = false
  message: Message = {
    id: '',
    messageId: '',
    channelId: this.currentChannelID,
    channelName:this.currentChannelName,
    name: '',
    avatar: 0,
    messageText: '',
    sendAt: `${this.dayString}, ${this.dayNumber}. ${this.month}`,
    sendAtTime: `${(this.hours < 10 ? '0' + this.hours : this.hours)}:${(this.minutes < 10 ? '0' + this.minutes : this.minutes)}`,
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
    private route: ActivatedRoute, private mainhelperservice: MainHelperService, private conversationservice: ConversationService, private messageService: MessageService
  ) {}


  ngOnInit(): void {
    this.loadRouter();
    this.loadName();
    this.loadDescription();
    this.loadChannelId();
    this.loadCurrentCrator();
    this.loadMembers();
    this.loadDate();
    this.loadActualUser();


  }

  toggleEmojiBar() {
    this.toggleEmoji = !this.toggleEmoji;
  }


      loadActualUser(){
    this.actualUserSubscription = this.mainservice.acutalUser$.subscribe(actualUser => {
      if (actualUser.length > 0) {
        this.actualUser = actualUser;
        console.log('aktueller User:', this.actualUser);
      }
    });
  }


  loadRouter() {
         this.route.pathFromRoot.forEach(route => {
    route.paramMap.subscribe(params => {
      if (params.has('channelId')) {
        const channelId = params.get('channelId');
        console.log('🎯 channelId gefunden über pathFromRoot:', channelId);
        this.channelId = channelId!;
        this.channelService.setCurrentChannel(this.channelId);
        this.loadMessages(channelId!);
      }
    });
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
  async loadMessages(channelId: string) {
    this.channelmessageService.subList(channelId);

    this.allMessageSubscription = this.channelmessageService.allMessages$.subscribe((messages) => {
  // Nur gültige Nachrichten durchlassen (z. B. messageText vorhanden)
  const filtered = messages.filter(message => !!message.messageText && message.messageText.trim() !== '');
  
  this.allMessages = filtered.filter(message => !message.isThread);
  this.channelmessageService.sortAllMessages(this.allMessages);
  this.allThreads = filtered.filter(message => message.isThread);
});

  }





  startEditName() {
    this.editName = true
  }

  saveName() {
    this.editName = false
  }

  startEditDescription() {
    this.editDescription = true
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
      this.openDialogMembers();
    });
  }

  openDialogMembers() {
    const dialogRef = this.dialog.open(AddUserComponent, {
      data: {
        allUsersChannel: this.allUsersChannel,
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

  sendmessage(channelid: string,channelname:string) {
    this.message.id = this.actualUser[0]?.id || '';
    this.message.name = this.actualUser[0]?.name || '';
    this.message.avatar = this.actualUser[0]?.avatar || 1;
    this.message.isOwn = true;

    this.channelmessageService.addMessage(this.message, channelid,channelname)

    this.message.messageText = '';
  }

}





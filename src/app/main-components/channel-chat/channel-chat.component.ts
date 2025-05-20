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
  members: Member[] = [];
  @Input() allUsersChannel: User[] = [];
  allUsers: User[] = [];
  allMessages: Message[] = [];
  allThreads: Message[] = [];
  readonly dialog = inject(MatDialog);
  overlayeditChannel: boolean = false;
  editName: boolean = false
  editDescription: boolean = false
  textInput: Message[] = [];
  toggleMemberInChat: boolean = false;
  months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  days = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
  d = new Date();
  month = this.months[this.d.getMonth()];
  dayString = this.days[this.d.getDay()];
  dayNumber = this.d.getDate();
  minutes = this.d.getMinutes();
  hours = this.d.getHours();
  channelId!: string;
    toggleEmoji: boolean = false
  openChannel = this.mainhelperservice.openChannel;
  allConversationMessages: ConversationMessage[] = [];
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
    private route: ActivatedRoute, private mainhelperservice: MainHelperService, private conversationservice: ConversationService, private messageService: MessageService,
  private _eref: ElementRef) {}


  ngOnInit(): void {
    this.loadRouter();
    this.loadName();
    this.loadDescription();
    this.loadChannelId();
    this.loadCurrentCrator();
    this.loadMembers();
    this.loadDate();
    this.loadActualUser();
    this.loadAllUser();

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
  const filtered = messages.filter(message => !!message.messageText && message.messageText.trim() !== '');
  
  this.allMessages = filtered.filter(message => !message.isThread);
  this.channelmessageService.sortAllMessages(this.allMessages);
  this.allThreads = filtered.filter(message => message.isThread);
});

  }



  addEmoji(event: any) {
    const emoji = event.emoji.native;
    console.log('emoji', emoji);
    

    this.message.messageText +=   emoji  ;

 
  
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
  const insertText = `@${member.name} `;
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

  sendmessage(channelid: string,channelname:string) {
    this.message.id = this.actualUser[0]?.id || '';
    this.message.name = this.actualUser[0]?.name || '';
    this.message.avatar = this.actualUser[0]?.avatar || 1;
    this.message.isOwn = true;

    this.channelmessageService.addMessage(this.message, channelid,channelname)

    this.message.messageText = '';
  }

}





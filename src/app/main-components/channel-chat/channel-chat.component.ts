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

@Component({
  selector: 'app-channel-chat',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, NgIf, CommonModule, FormsModule],
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
  private actualUserSubscription!: Subscription
  
  members: Member[] = [];
  @Input() allUsersChannel: User[] = [];
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

  message: Message = {
    id: '',
    messageId: '',
    channelId: '',
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



  constructor(private channelService: ChannelService, private ngZone: NgZone, private channelmessageService: ChannelMessageService,private mainservice: MainComponentService) { }


  ngOnInit(): void {
    this.loadName()
    this.loadDescription()
    this.loadChannelId()
    this.loadCurrentCrator()
    this.loadMembers()
    this.loadDate()
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

  loadActualUser() {
    this.actualUserSubscription = this.mainservice.acutalUser$.subscribe(actualUser => {
      if (actualUser.length > 0) {
        this.actualUser = actualUser;
        console.log('aktueller User:', this.actualUser);
      }
    });
  }


loadMembers() {
  this.channelService.channelMember$.subscribe(members => {
    this.members = members;
    console.log('this.members', this.members);

  });
}

loadDate(){
  this.channelService.currentChannelDate$.subscribe(date => {
    this.currentChannelDate = date;
  })
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
    // Stelle sicher, dass die Aktualisierung innerhalb der Angular-Zone läuft
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

sendmessage(channelid: string){
   this.message.id = this.actualUser[0]?.id || '';
    this.message.name = this.actualUser[0]?.name || '';
    this.message.avatar = this.actualUser[0]?.avatar || 1;
    this.message.isOwn = true;

  this.channelmessageService.addMessage(this.message, channelid,)

  this.message.messageText='';
}
  
}





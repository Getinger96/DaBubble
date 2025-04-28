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
  members: Member[] = [];
  @Input() allUsersChannel: User[] = [];
  readonly dialog = inject(MatDialog);
  overlayeditChannel: boolean = false;
  editName: boolean = false
  editDescription: boolean = false



  constructor(private channelService: ChannelService,) { }


  ngOnInit(): void {
    this.channelService.currentChannelName$.subscribe(name => {
      this.currentChannelName = name;
      console.log( this.currentChannelName);
      
    });
    this.channelService.currentChannelDescription$.subscribe(description => {
      this.currentChannelDescription = description;
    });
    this.channelService.currentChannelCreator$.subscribe(creator => {
      this.currentChannelCreator = creator;
    });
    this.channelService.currentChannelId$.subscribe(id => {
      this.currentChannelID = id;
    });
    this.loadMembers()
  }


  loadMembers() {
    this.channelService.channelMember$.subscribe(members => {
      this.members = members;
      console.log('this.members', this.members);
      
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
    this.dialog.open(ShowUserComponent, {
      data: { allUsersChannel: this.allUsersChannel },
      panelClass: 'another-dialog-position'
    });
  }

  openDialogMembers() {
    this.dialog.open(AddUserComponent, {
      data: { 
        allUsersChannel: this.allUsersChannel,
        members: this.members,
        currentChannelID: this.currentChannelID
      },
      panelClass: 'another-dialog-position'
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

  updateChannel(event: Event, ngForm: NgForm,id:string) {

    this.channelService.updateChannel(this.currentChannelID, this.currentChannelName, this.currentChannelDescription)

    this.closeOverlay()
  }

  deleteChannel(){
    this.channelService.deleteChannel(this.currentChannelID)
    this.closeOverlay()
  }
}





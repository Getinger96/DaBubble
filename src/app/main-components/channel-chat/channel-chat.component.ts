import { Component, OnInit, inject } from '@angular/core';
import { ChannelService } from '../../firebase-services/channel.service';
import {MatDialog,MatDialogActions,MatDialogClose,MatDialogContent,MatDialogTitle,} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ShowUserComponent } from './show-user/show-user.component';
import {MatIconModule} from '@angular/material/icon';
import { HostListener } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { Channel } from '../../interfaces/channel.interface';

@Component({
  selector: 'app-channel-chat',
  standalone: true,
  imports: [MatButtonModule,MatIconModule,NgIf,CommonModule,FormsModule ],
  templateUrl: './channel-chat.component.html',
  styleUrl: './channel-chat.component.scss'
})
export class ChannelChatComponent implements OnInit {
  currentChannelName: string = '';
  currentChannelDescription:string='';
  currentChannelCreator:string='';
  currentChannelID:string='';
  readonly dialog = inject(MatDialog);
  overlayeditChannel:boolean= false;
   editName:boolean=false
   editDescription:boolean=false



  constructor(private channelService: ChannelService, ) {}


  ngOnInit(): void {
    this.channelService.currentChannelName$.subscribe(name => {
      this.currentChannelName = name;
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
  }

  startEditName(){
    this.editName=true
  }

  saveName(){
    this.editName=false
  }

  startEditDescription(){
    this.editDescription=true
  }

  saveDescription(){
    this.editDescription=false
  }

  openDialog() {
    this.dialog.open(ShowUserComponent);
  }

  closeOverlay(){
    this.overlayeditChannel=false;
  }

  openoverlay(){
    this.overlayeditChannel=true;
  }

  onDialogClick(event: MouseEvent) {
    event.stopPropagation();
  }

  updateChannel(event: Event, ngForm: NgForm,id:string){

this.channelService.updateChannel(this.currentChannelID,this.currentChannelName,this.currentChannelDescription)

this.closeOverlay()
  }
}

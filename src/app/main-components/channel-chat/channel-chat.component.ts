import { Component, OnInit, inject, Input } from '@angular/core';
import { ChannelService } from '../../firebase-services/channel.service';
import {MatDialog,MatDialogActions,MatDialogClose,MatDialogContent,MatDialogTitle,} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ShowUserComponent } from './show-user/show-user.component';
import {MatIconModule} from '@angular/material/icon';
import { HostListener } from '@angular/core';
<<<<<<< HEAD
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { Channel } from '../../interfaces/channel.interface';
=======
import { User } from '../../interfaces/user.interface';
import { NgIf, CommonModule } from '@angular/common';

>>>>>>> 36ccfa51552771fef22bc1bae9d4e8f9ee91f200

@Component({
  selector: 'app-channel-chat',
  standalone: true,
<<<<<<< HEAD
  imports: [MatButtonModule,MatIconModule,NgIf,CommonModule,FormsModule ],
=======
  imports: [MatButtonModule,MatIconModule, CommonModule ],
>>>>>>> 36ccfa51552771fef22bc1bae9d4e8f9ee91f200
  templateUrl: './channel-chat.component.html',
  styleUrl: './channel-chat.component.scss'
})
export class ChannelChatComponent implements OnInit {
  currentChannelName: string = '';
<<<<<<< HEAD
  currentChannelDescription:string='';
  currentChannelCreator:string='';
  currentChannelID:string='';
=======
  @Input() allUsersChannel: User[] = [];
>>>>>>> 36ccfa51552771fef22bc1bae9d4e8f9ee91f200
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
    this.dialog.open(ShowUserComponent, {
      data: { allUsersChannel: this.allUsersChannel },
      panelClass: 'another-dialog-position'
    });
  }

<<<<<<< HEAD
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
=======

}
>>>>>>> 36ccfa51552771fef22bc1bae9d4e8f9ee91f200

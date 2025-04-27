import { Component, OnInit, inject } from '@angular/core';
import { ChannelService } from '../../firebase-services/channel.service';
import {MatDialog,MatDialogActions,MatDialogClose,MatDialogContent,MatDialogTitle,} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ShowUserComponent } from './show-user/show-user.component';
import {MatIconModule} from '@angular/material/icon';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-channel-chat',
  standalone: true,
  imports: [MatButtonModule,MatIconModule ],
  templateUrl: './channel-chat.component.html',
  styleUrl: './channel-chat.component.scss'
})
export class ChannelChatComponent implements OnInit {
  currentChannelName: string = '';
  readonly dialog = inject(MatDialog);


  constructor(private channelService: ChannelService, ) {}


  ngOnInit(): void {
    this.channelService.currentChannelName$.subscribe(name => {
      this.currentChannelName = name;
    });
  }

  openDialog() {
    this.dialog.open(ShowUserComponent);
  }
}

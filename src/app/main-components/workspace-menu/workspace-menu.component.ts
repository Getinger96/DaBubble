import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { DirectMessageUserComponent } from './direct-message-user/direct-message-user.component';
import { User } from '../../interfaces/user.interface';
import { CommonModule } from '@angular/common';
import { Channel } from '../../interfaces/channel.interface';
import { FormsModule, NgForm } from '@angular/forms';
import { RegisterService } from '../../firebase-services/register.service';

@Component({
  selector: 'app-workspace-menu',
  standalone: true,
  imports: [NgIf, DirectMessageUserComponent, CommonModule, FormsModule],
  templateUrl: './workspace-menu.component.html',
  styleUrl: './workspace-menu.component.scss'
})
export class WorkspaceMenuComponent {

  openChannels: boolean = true;
  openDirectMessages: boolean = true;
  overlayvisible: boolean = false;
  overlay2Visible: boolean = false;
  @Input() userArray!: User[];
  channel: Channel = new Channel();

  constructor(private registerservice: RegisterService) {

  }

  toggleChannels() {
    if (this.openChannels) { this.openChannels = false; }
    else if (!this.openChannels) { this.openChannels = true; }
  }

  toggleDirectMessages() {
    if (this.openDirectMessages) { this.openDirectMessages = false; }
    else if (!this.openDirectMessages) { this.openDirectMessages = true; }
  }

  openOverlay() {
    this.overlayvisible = true
  }

  closeOverlay() {
    this.overlayvisible = false
    this.overlay2Visible = false
  }

  onDialogClick(event: MouseEvent) {
    event.stopPropagation();
  }

  addChannel(event: Event, ngForm: NgForm) {
    this.registerservice.addChannel(this.registerservice.setChannelObject(this.channel), event)

    this.closeOverlay()


    this.overlay2Visible = true




  }

}

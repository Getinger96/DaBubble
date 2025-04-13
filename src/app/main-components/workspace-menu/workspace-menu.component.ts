import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { DirectMessageUserComponent } from './direct-message-user/direct-message-user.component';
import { User } from '../../interfaces/user.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-workspace-menu',
  standalone: true,
  imports: [NgIf, DirectMessageUserComponent,CommonModule],
  templateUrl: './workspace-menu.component.html',
  styleUrl: './workspace-menu.component.scss'
})
export class WorkspaceMenuComponent {

  openChannels:boolean = true;
  openDirectMessages:boolean = true;
  overlayvisible:boolean=false;
  @Input() userArray!: User[];

  toggleChannels() {
    if(this.openChannels) {this.openChannels = false;} 
    else if(!this.openChannels) {this.openChannels = true;}
  }

  toggleDirectMessages() {
    if(this.openDirectMessages) {this.openDirectMessages = false;} 
    else if(!this.openDirectMessages) {this.openDirectMessages = true;}
  }

  openOverlay(){
    this.overlayvisible=true
  }

  closeOverlay(){
    this.overlayvisible=false
  }

  onDialogClick(event: MouseEvent) {
    event.stopPropagation();
  }

}

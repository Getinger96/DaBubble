import { Component, Input, model } from '@angular/core';
import { NgIf } from '@angular/common';
import { DirectMessageUserComponent } from './direct-message-user/direct-message-user.component';
import { User } from '../../interfaces/user.interface';
import { CommonModule } from '@angular/common';
import { Channel } from '../../interfaces/channel.interface';
import { FormsModule, NgForm } from '@angular/forms';
import { RegisterService } from '../../firebase-services/register.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { Subscription } from 'rxjs';




@Component({
  selector: 'app-workspace-menu',
  standalone: true,
  imports: [NgIf, DirectMessageUserComponent, CommonModule, FormsModule, MatCheckboxModule, MatRadioModule],
  templateUrl: './workspace-menu.component.html',
  styleUrl: './workspace-menu.component.scss'
})
export class WorkspaceMenuComponent {
  searchTerm: string = '';
  openChannels: boolean = true;
  openDirectMessages: boolean = true;
  overlayvisible: boolean = false;
  overlay2Visible: boolean = false;
  @Input() userArray!: User[];
  channel: Channel = new Channel();
  selectedOption: string = '';
  allUsers: User[] = [];
  createdChannelId: string | null = null;
  createdChannelData: any = null;
  private usersSubscription!: Subscription;
  filteredUsers = [...this.allUsers];
  selectedUsers: any[] = [];


  constructor(private registerservice: RegisterService) {

  }


  ngOnInit(): void {
    this.usersSubscription = this.registerservice.allUsers$.subscribe(users => {
      if (users.length > 0) {
        this.allUsers = users;

        console.log('Benutzer in der Komponente:', this.allUsers);
      }
    });
  }


  filterUsers() {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.allUsers.filter(user =>
      user.name.toLowerCase().includes(term)
    );
  }

  selectUser(user: any) {
    if (!this.selectedUsers.includes(user)) {
      this.selectedUsers.push(user);
      this.searchTerm = '';  // Inputfeld leeren
      this.filterUsers();    // Liste neu filtern
    }
  }

  removeUser(user: any) {
    this.selectedUsers = this.selectedUsers.filter(u => u !== user);
    this.filterUsers(); // nach Entfernen neu filtern
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
    event.preventDefault();

    const channelObj = this.registerservice.setChannelObject(this.channel, this.channel.id);

    this.registerservice.addChannel(channelObj, event).then((docRef) => {
      // ✅ docRef enthält die ID des neuen Channels
      this.createdChannelId = docRef.id;
      this.createdChannelData = channelObj;

      console.log('🎉 Channel erstellt mit ID:', this.createdChannelId);

      // Jetzt Overlay wechseln
      this.closeOverlay();
      ngForm.reset()
      this.overlay2Visible = true;
    }).catch((error) => {
      console.error("❌ Fehler beim Erstellen des Channels:", error);
    });





  }


  addMembers() {
    if (this.selectedOption === 'all') {
      this.addAllMembersToChannel(this.createdChannelId!);
    } else if (this.selectedOption === 'some') {
      const members = this.selectedUsers.map(user => user.name); // oder user.id, je nach Backend-Anforderung
      this.addSpecificMembersToChannel(this.createdChannelId!, members);
    }

    this.closeOverlay();

  }

  addAllMembersToChannel(channelId: string) {
    const allUsers = this.allUsers.map(user => user.name); // oder user.uid, je nachdem
    this.registerservice.addMembersToChannel(channelId, allUsers);
  }

  addSpecificMembersToChannel(channelId: string, members: string[]) {
    this.registerservice.addMembersToChannel(channelId, members);
  }

}

import { Component, EventEmitter, Input, model, Output, Pipe, PipeTransform } from '@angular/core';
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
import { ChannelService } from '../../firebase-services/channel.service';
import { MainComponentService } from '../../firebase-services/main-component.service';
import { ChannelMessageService } from '../../firebase-services/channel-message.service';
import { MainHelperService } from '../../services/main-helper.service';
import { Member } from '../../interfaces/member.interface';
import { Router } from '@angular/router';

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
  @Input() actualUser!: User[];
  @Output() closeThread = new EventEmitter<void>();
  channel: Channel = new Channel();
  selectedOption: string = '';
  allUsers: User[] = [];
  createdChannelId: any;
  createdChannelData: any = null;
  private usersSubscription!: Subscription;
  filteredUsers = [...this.allUsers];
  selectedUsers: any[] = [];
  channels: Channel[] = [];
  userId?: string;
   private actualUserSubscription!: Subscription;


  constructor(private registerservice: RegisterService, private channelservice: ChannelService, private mainservice: MainComponentService,
    private mainHelperService: MainHelperService, private channelMessageService: ChannelMessageService, private router: Router
  ) {

  }


  ngOnInit(): void {
    
    this.usersSubscription = this.mainservice.allUsers$.subscribe(users => {
      if (users.length > 0) {
        this.allUsers = users.filter(user => user.email !== 'guest@gmail.com');

        console.log('Benutzer in der Komponente:', this.allUsers);
      }
    });
    this.channelservice.channels$.subscribe(channels => {
      this.channels = channels;
      console.log('Channels in Component:', this.channels);
    });


  }
  sortUsers() {
    this.filteredUsers.sort((a, b) => a.name.localeCompare(b.name, 'de', { sensitivity: 'base' }))
  }

  filterUsers() {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.allUsers
      .filter(user =>
        user.name.toLowerCase().includes(term)
      )
      .filter(user =>
        !this.selectedUsers.includes(user)
      );

    this.sortUsers();
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

  closeOverlay(ngForm: NgForm) {
    this.overlayvisible = false
    this.overlay2Visible = false
    ngForm.reset()

  }

  onDialogClick(event: MouseEvent) {
    event.stopPropagation();
  }

  addChannel(event: Event, ngForm: NgForm) {
    event.preventDefault();


    const channelObj = this.channelservice.setChannelObject(this.channel, this.channel.id);

    this.channelservice.addChannel(channelObj).then((docRef) => {
      this.channelservice.addsubcolecctiontoChannel(docRef.id)
      // ✅ docRef enthält die ID des neuen Channels
      this.createdChannelId = docRef.id;

      console.log('🎉 Channel erstellt mit ID:', this.createdChannelId);

      // Jetzt Overlay wechseln
      this.closeOverlay(ngForm);
      ngForm.reset()
      this.overlay2Visible = true;
    }).catch((error) => {
      console.error("❌ Fehler beim Erstellen des Channels:", error);
    });





  }

   loadActualUser(){
    this.actualUserSubscription = this.mainservice.acutalUser$.subscribe(actualUser => {
      if (actualUser.length > 0) {
        this.actualUser = actualUser;
        console.log('aktueller User:', this.actualUser);
      }
    });
  }


  openChannel(isOpen: boolean, name: string, description: string, creator: string, id: string, members: Member[], date: string) {
    this.mainHelperService.openChannelSection(isOpen);
    this.channelservice.setChannelName(name);
    this.channelservice.setChannelDescription(description);
    this.channelservice.setChannelcreator(creator);
    this.channelservice.setChannelId(id)
    this.channelservice.setChannelMember(members);
    this.channelservice.setChanneldate(date)
    this.mainservice.showdirectmessage = false;
    this.userId = this.actualUser[0].id;
    this.router.navigateByUrl(`/main-components/${this.userId}/channel/${id}`);
    this.channelMessageService.getChannelId(id)

  }

  addMembers(ngForm: NgForm) {
    if (this.selectedOption === 'all') {
      this.addAllMembersToChannel(this.createdChannelId!);
    } else if (this.selectedOption === 'some') {
      const members = this.selectedUsers.map(user => ({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        status: user.status
      }));; // oder user.id, je nach Backend-Anforderung
      this.addSpecificMembersToChannel(this.createdChannelId!, members);
    }

    this.closeOverlay(ngForm);

  }

  addAllMembersToChannel(channelId: string) {
    const allUsers = this.allUsers.map(user => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      status: user.status
    }));
    this.channelservice.addMembersToChannel(channelId, allUsers);
  }

  addSpecificMembersToChannel(channelId: string, members: { id: string, name: string, avatar: number }[]) {
    this.channelservice.addMembersToChannel(channelId, members);
  }

 isUserInChannel(channel: Channel): boolean {
  return channel.members.some(member => member.id === this.actualUser[0].id);
}

}

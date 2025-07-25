import { Component, Input, OnInit, OnChanges, AfterViewInit, Output, EventEmitter, ViewChild, SimpleChanges } from '@angular/core';
import { NgIf, CommonModule } from '@angular/common';
import { User } from '../../../interfaces/user.interface';
import { RegisterService } from '../../../firebase-services/register.service';
import { LoadingService } from '../../../services/loading.service';
import { Subscription } from 'rxjs';
import { MainComponentService } from '../../../firebase-services/main-component.service';
import { MainHelperService } from '../../../services/main-helper.service';
import { user } from '@angular/fire/auth';
import { DirectMessageChatComponent } from '../../direct-message-chat/direct-message-chat.component';
import { Router } from '@angular/router';
import { ThreadComponent } from '../../thread/thread.component';
import { ConversationService } from '../../../firebase-services/conversation.service';
import { MainComponentsComponent } from '../../main-components.component';


@Component({
  selector: 'app-direct-message-user',
  standalone: true,
  imports: [NgIf, CommonModule],
  templateUrl: './direct-message-user.component.html',
  styleUrl: './direct-message-user.component.scss'
})
export class DirectMessageUserComponent implements OnInit, OnChanges {
  actualUser: User[] = [];
  @Input() ownAccount!: boolean;
  @Input() userArray: User[] = [];
  @Output() closeThread = new EventEmitter<void>();
  @Output() toggleWorkspaceDirectuser = new EventEmitter<void>();
  private usersSubscription!: Subscription;
  private actualUserSubscription!: Subscription;
  @ViewChild(DirectMessageChatComponent) directMessageChatComponent!: DirectMessageChatComponent;
  constructor(private registerservice: RegisterService, private loadingService: LoadingService, private mainservice: MainComponentService, private mainhelperService: MainHelperService, private mainComponent: MainComponentsComponent,private router: Router) {
  
  }

  ngOnInit(): void {

  this.loadActualUser()


  }

ngOnChanges(changes: SimpleChanges): void {
  this.sortUsers();
}
  

  opendirectChat(id: string,name: string, close: boolean, avatar: number, email: string, status: string) {

       if (!this.actualUser || this.actualUser.length === 0) {
      console.warn('actualUser not loaded yet');
      return;
    }

    this.mainhelperService.openChannelSection(close)
    this.mainservice.setDirectmessageuserName(name)
    this.mainservice.setDirectmessageuserEmail(email)
    this.mainservice.setDirectmessageuserAvatar(avatar)
    this.mainservice.setDirectmessageuserStatus(status)
    this.mainservice.setDirectmessageuserId(id)
    this.router.navigate(['/main-components/' + this.actualUser[0].id+'/directmessage/'+ id], { replaceUrl: true })
    this.mainhelperService.openNewChat =false;
    this.mainservice.showmainchat=false
    this.mainservice.showdirectmessage = true
    this.closeThread.emit();
    this.mainhelperService.focusDirectMessage$.next();
   
  const width = window.innerWidth;
    if (width <= 900) {
       this.toggleWorkspaceDirectuser.emit();
    }
  }



  loadActualUser() {
    this.actualUserSubscription = this.mainservice.acutalUser$.subscribe(actualUser => {
      if (actualUser.length > 0) {
        this.actualUser = actualUser

        this.sortUsers()
      }
      
      
    });
    
  }

  sortUsers() {

        if (!this.userArray || !this.actualUser || this.actualUser.length === 0) {
      return;
    }

    this.userArray.sort((a, b) => {
      if (a.id === this.actualUser[0].id) return -1;
      if (b.id === this.actualUser[0].id) return 1;
      return 0;
    })
  }

    get isDataLoaded(): boolean {
    return this.actualUser && this.actualUser.length > 0 && this.userArray && this.userArray.length > 0;
  }

    ngOnDestroy(): void {
    if (this.usersSubscription) {
      this.usersSubscription.unsubscribe();
    }
    if (this.actualUserSubscription) {
      this.actualUserSubscription.unsubscribe();
    }
  }


  

}

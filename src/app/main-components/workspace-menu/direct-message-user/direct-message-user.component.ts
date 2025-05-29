import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { NgIf, CommonModule } from '@angular/common';
import { User } from '../../../interfaces/user.interface';
import { RegisterService } from '../../../firebase-services/register.service';
import { LoadingService } from '../../../services/loading.service';
import { Subscription } from 'rxjs';
import { MainComponentService } from '../../../firebase-services/main-component.service';
import { MainHelperService } from '../../../services/main-helper.service';
import { user } from '@angular/fire/auth';
import { DirectMessageChatComponent } from '../../direct-message-chat/direct-message-chat.component';

@Component({
  selector: 'app-direct-message-user',
  standalone: true,
  imports: [NgIf, CommonModule],
  templateUrl: './direct-message-user.component.html',
  styleUrl: './direct-message-user.component.scss'
})
export class DirectMessageUserComponent implements OnInit {
  actualUser: User[] = [];
  @Input() ownAccount!: boolean;
  @Input() userArray: User[] = [];
  private usersSubscription!: Subscription;
  private actualUserSubscription!: Subscription;
  private directMessageChatComponent!: DirectMessageChatComponent;
  constructor(private registerservice: RegisterService, private loadingService: LoadingService, private mainservice: MainComponentService, private mainhelperService: MainHelperService) {
  
  }

  ngOnInit(): void {

  this.loadActualUser()


  }

  opendirectChat(id: string,name: string, close: boolean, avatar: number, email: string, status: string) {

       if (!this.actualUser || this.actualUser.length === 0) {
      console.warn('actualUser not loaded yet');
      return;
    }

    this.mainservice.showdirectmessage = true
    this.mainhelperService.openChannelSection(close)
    this.mainservice.setDirectmessageuserName(name)
    this.mainservice.setDirectmessageuserEmail(email)
    this.mainservice.setDirectmessageuserAvatar(avatar)
    this.mainservice.setDirectmessageuserStatus(status)
    this.mainservice.setDirectmessageuserId(id)

    console.log(this.actualUser[0].id, this.mainservice.directmessaeUserIdSubject.value )
  }

  loadActualUser() {
    this.actualUserSubscription = this.mainservice.acutalUser$.subscribe(actualUser => {
      if (actualUser.length > 0) {
        this.actualUser = actualUser

        console.log('actualUser[0]', actualUser[0]);
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

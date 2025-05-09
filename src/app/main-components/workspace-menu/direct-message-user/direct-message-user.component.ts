import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { NgIf, CommonModule } from '@angular/common';
import { User } from '../../../interfaces/user.interface';
import { RegisterService } from '../../../firebase-services/register.service';
import { LoadingService } from '../../../services/loading.service';
import { Subscription } from 'rxjs';
import { MainComponentService } from '../../../firebase-services/main-component.service';
import { MainHelperService } from '../../../services/main-helper.service';
import { user } from '@angular/fire/auth';

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
  @Input() userArray!: User[];
  private usersSubscription!: Subscription;
  private actualUserSubscription!: Subscription;
  constructor(private registerservice: RegisterService, private loadingService: LoadingService, private mainservice: MainComponentService, private mainhelperService: MainHelperService) {

  }

  ngOnInit(): void {

  this.loadActualUser()


  }

  opendirectChat(id: string,name: string, close: boolean, avatar: number, email: string, status: string) {
    this.mainservice.showdirectmessage = true
    this.mainhelperService.openChannelSection(close)
    this.mainservice.setDirectmessageuserName(name)
    this.mainservice.setDirectmessageuserEmail(email)
    this.mainservice.setDirectmessageuserAvatar(avatar)
    this.mainservice.setDirectmessageuserStatus(status)
    this.mainservice.setDirectmessageuserId(id)
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
    this.userArray.sort((a, b) => {
      if (a.id === this.actualUser[0].id) return -1;
      if (b.id === this.actualUser[0].id) return 1;
      return 0;


    })
  }

}

import { Component, HostListener, OnInit, Output } from '@angular/core';
import { User } from '../../interfaces/user.interface';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router, RouterModule  } from '@angular/router';
import { MainComponentService } from '../../firebase-services/main-component.service';
import { LoginService } from '../../firebase-services/login.service';
import { UserCardMenuComponent } from './user-card-menu/user-card-menu.component';
import { UserCardService } from './services/user-card.service';
import { EditUserComponent } from './edit-user/edit-user.component';
import { ChangeAvatarCardComponent } from "./change-avatar-card/change-avatar-card.component";


@Component({
  selector: 'app-active-user',
  standalone: true,
  imports: [CommonModule, RouterModule, UserCardMenuComponent, EditUserComponent, ChangeAvatarCardComponent],
  templateUrl: './active-user.component.html',
  styleUrl: './active-user.component.scss'
})

export class ActiveUserComponent implements OnInit {
  avatar?:number;
  name?:string;
  email?:string;
  actualUser:User[]= [];
  loadingStatus: boolean = false;
  overlayvisible:boolean=false;
  showUserCard:boolean=false;
  @Output() userId?: string;
  private actualUserSubscription!: Subscription;
 
  constructor(
    private router: Router, private mainservice:MainComponentService, private loginservice:LoginService, public usercardservice: UserCardService){
  }

  openOverlay(){
    this.overlayvisible=true
    document.body.style.overflow = 'hidden'; 
  }

  ngOnInit(): void {
    this.actualUserSubscription = this.mainservice.acutalUser$.subscribe(actualUser => {
      if (actualUser.length > 0) {
        this.actualUser = actualUser
        this.userId = actualUser[0].id
        console.log('actualUser[0]', actualUser[0]);
        
      }
    });
  }


  showUserCardMenu() {
    this.showUserCard = true;
  }


  closeOverlay() {
    this.overlayvisible = false;
    document.body.style.overflow = 'auto';
    this.usercardservice.overlayUserCardActive = false;
    this.usercardservice.overlayEditUserActive = false;
    this.usercardservice.overlayEditChangAvatar =false;
  }

  logOut(){
    let actual = this.actualUser[0].uid
    this.loginservice.updateStatusByUid(actual,'Offline')
    document.body.style.overflow = 'auto';
    setTimeout(() => {
      this.router.navigate(['']);
      }, 1000);
  }

}

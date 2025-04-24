import { Injectable } from '@angular/core';
import { RegisterService } from '../../../firebase-services/register.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MainComponentService } from '../../../firebase-services/main-component.service';
import { LoginService } from '../../../firebase-services/login.service';
import { Subscription } from 'rxjs';
import { User } from '../../../interfaces/user.interface';
import { AuthService } from '../../../firebase-services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserCardService {
  private usersSubscription!: Subscription;
  overlayUserCardActive: boolean = false;
  overlayEditUserActive: boolean = false;
  userId?:string;
  avatar?:number;
  name?:string;
  email?:string;
  actualUser: User[] = [];

  constructor(
    private registerservice: RegisterService,
    private mainservice:MainComponentService,
    private authservice:AuthService) {
      this.usersSubscription = this.mainservice.allUsers$.subscribe(users => {
        this.actualUser = users;
        this.userId = this.actualUser[0].id
      });
      
      if (this.userId && this.actualUser.length > 0) {
        const user = this.actualUser.find(u => u.id === this.userId);
        if (user) {
          this.name = user.name;
          this.email = user.email;
          this.avatar = user.avatar;
      }
    }
  }
  
}

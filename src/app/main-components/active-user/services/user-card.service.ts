import { Injectable, OnInit } from '@angular/core';
import { MainComponentService,  } from '../../../firebase-services/main-component.service';
import { Subscription } from 'rxjs';
import { User } from '../../../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserCardService implements OnInit {
  private usersSubscription!: Subscription;
  private actualUserSubscription!: Subscription;
  overlayUserCardActive: boolean = false;
  overlayEditUserActive: boolean = false;
  userId?:string;
  avatar?:number;
  name?:string;
  email?:string;
  actualUser: User[] = [];

  constructor(
    private mainservice:MainComponentService,
  ) {
      
    //     if (this.userId && this.actualUser.length > 0) {
      //     const user = this.actualUser.find(u => u.id === this.userId);
     //      if (user) {
     //        this.name = user.name;
    //         this.email = user.email;
    //         this.avatar = user.avatar;
   //      }
   //    }
  //   }
  
 //  }



    }

    ngOnInit(): void {
      this.actualUserSubscription = this.mainservice.acutalUser$.subscribe(actualUser => {
        if (actualUser.length > 0) {
          this.actualUser = actualUser
          this.userId = actualUser[0].id;
          this.avatar = actualUser[0].avatar;   
          this.name = actualUser[0].name;
          this.email = actualUser[0].email;         
        }
      });
    }

  }
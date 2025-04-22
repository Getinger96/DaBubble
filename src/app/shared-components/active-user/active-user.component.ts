import { Component, HostListener, OnInit } from '@angular/core';
import { User } from '../../interfaces/user.interface';
import { RegisterService } from '../../firebase-services/register.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router, RouterModule  } from '@angular/router';
import { MainComponentService } from '../../firebase-services/main-component.service';
import { LoginService } from '../../firebase-services/login.service';
@Component({
  selector: 'app-active-user',
  standalone: true,
  imports: [CommonModule, RouterModule ],
  templateUrl: './active-user.component.html',
  styleUrl: './active-user.component.scss'
})
export class ActiveUserComponent implements OnInit {
  actualUser:User[]= []
  loadingStatus: boolean = false;
  overlayvisible:boolean=false;
  userId?: string
  private actualUserSubscription!: Subscription;
 

  constructor(private registerservice: RegisterService,private route: ActivatedRoute,
      private router: Router,private mainservice:MainComponentService,private loginservice:LoginService){
  }
openoverlay(){
  this.overlayvisible=true
  document.body.style.overflow = 'hidden'; 
}

ngOnInit(): void {
  this.actualUserSubscription = this.mainservice.acutalUser$.subscribe(actualUser => {
    if (actualUser.length > 0) {
      this.actualUser = actualUser
      this.userId = actualUser[0].id
      console.log('aktueller User:', this.actualUser);
    }
  });
}

closeOverlay() {
  this.overlayvisible = false;
  document.body.style.overflow = 'auto';
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

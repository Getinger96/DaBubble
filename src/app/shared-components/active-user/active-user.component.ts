import { Component, HostListener, OnInit } from '@angular/core';
import { User } from '../../interfaces/user.interface';
import { RegisterService } from '../../firebase-services/register.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-active-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './active-user.component.html',
  styleUrl: './active-user.component.scss'
})
export class ActiveUserComponent implements OnInit {
  actualUser:User[]= []
  loadingStatus: boolean = false;
 overlayvisible:boolean=false;
 private actualUserSubscription!: Subscription;
 

  constructor(private registerservice: RegisterService,private route: ActivatedRoute,
      private router: Router){
   

  }
openoverlay(){
  this.overlayvisible=true
  document.body.style.overflow = 'hidden'; 
}

ngOnInit(): void {
  this.actualUserSubscription = this.registerservice.acutalUser$.subscribe(actualUser => {
    if (actualUser.length > 0) {
      this.actualUser = actualUser
      console.log('aktueller User:', this.actualUser);
    }
  });
}


// @HostListener('document:click', ['$event'])
// onClickOutside(event: MouseEvent) {
//   const overlay = document.querySelector('.profile-dialog');
//   const target = event.target as HTMLElement;

//   // Wenn der Klick außerhalb des Overlays war, schließe das Overlay
//   if (overlay && !overlay.contains(target) && !target.closest('.active-user')) {
//     this.overlayvisible = false;
//   }
// }

// // Verhindern, dass das Overlay beim Klicken darauf schließt
// onOverlayClick(event: MouseEvent) {
//   event.stopPropagation(); // Verhindert das Schließen des Overlays, wenn du darauf klickst
// }


closeOverlay() {
  this.overlayvisible = false;
  document.body.style.overflow = 'auto';
}
logOut(){
let actual = this.actualUser[0].uid
this.registerservice.updateStatusByUid(actual,'Offline')
setTimeout(() => {
  this.router.navigate(['']);
}, 3000);
}
}

import { Component, HostListener } from '@angular/core';
import { User } from '../../interfaces/user.interface';
import { RegisterService } from '../../firebase-services/register.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-active-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './active-user.component.html',
  styleUrl: './active-user.component.scss'
})
export class ActiveUserComponent {
  actualUser:User[]= []
  loadingStatus: boolean = false;
 overlayvisible:boolean=false;
 

  constructor(private loadingService: LoadingService,private registerservice: RegisterService){
  
  this.actualUser=registerservice.actualUser;
}


  
openoverlay(){
  this.overlayvisible=true
}


@HostListener('document:click', ['$event'])
onClickOutside(event: MouseEvent) {
  const overlay = document.querySelector('.profile-dialog');
  const target = event.target as HTMLElement;

  // Wenn der Klick außerhalb des Overlays war, schließe das Overlay
  if (overlay && !overlay.contains(target) && !target.closest('.active-user')) {
    this.overlayvisible = false;
  }
}

// Verhindern, dass das Overlay beim Klicken darauf schließt
onOverlayClick(event: MouseEvent) {
  event.stopPropagation(); // Verhindert das Schließen des Overlays, wenn du darauf klickst
}
}
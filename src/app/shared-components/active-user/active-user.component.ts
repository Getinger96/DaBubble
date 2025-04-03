import { Component } from '@angular/core';
import { User } from '../../interfaces/user.interface';
import { RegisterService } from '../../firebase-services/register.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-active-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './active-user.component.html',
  styleUrl: './active-user.component.scss'
})
export class ActiveUserComponent {
 actualUser:User[]= []
 overlayvisible:boolean=false;

  constructor(private registerservice: RegisterService){
    this.actualUser=this.registerservice.actualUser
    

  }
openoverlay(){
  this.overlayvisible=true
}
}

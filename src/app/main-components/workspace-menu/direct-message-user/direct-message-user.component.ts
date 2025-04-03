import { Component, Input } from '@angular/core';
import { NgIf,CommonModule } from '@angular/common';
import { User } from '../../../interfaces/user.interface';
import { RegisterService } from '../../../firebase-services/register.service';

@Component({
  selector: 'app-direct-message-user',
  standalone: true,
  imports: [NgIf,CommonModule],
  templateUrl: './direct-message-user.component.html',
  styleUrl: './direct-message-user.component.scss'
})
export class DirectMessageUserComponent {

  @Input() username!:string;
  @Input() ownAccount!:boolean;
  @Input() avatar!:number;
  @Input() status!:string;
  allUsers: User[] = [];
  actualUser:User[]= []

  constructor(private registerservice: RegisterService){
    this.allUsers=this.registerservice.allUsers
    

  }


}

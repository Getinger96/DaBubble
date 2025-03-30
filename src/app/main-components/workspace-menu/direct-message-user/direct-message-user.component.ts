import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { User } from '../../../interfaces/user.interface';

@Component({
  selector: 'app-direct-message-user',
  standalone: true,
  imports: [NgIf],
  templateUrl: './direct-message-user.component.html',
  styleUrl: './direct-message-user.component.scss'
})
export class DirectMessageUserComponent {

  @Input() username!:string;
  @Input() ownAccount!:boolean;
  @Input() avatar!:number;
  @Input() status!:string;
 


}

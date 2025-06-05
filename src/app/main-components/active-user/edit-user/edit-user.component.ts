import { Component, Input } from '@angular/core';
import { UserCardService } from '../services/user-card.service';
import { NgClass } from '@angular/common';
import { User } from '../../../interfaces/user.interface';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [NgClass],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss'
})
export class EditUserComponent {
   @Input() actualUserUserCard: User[] = [];
  constructor(public usercardservice: UserCardService) {

  }
}

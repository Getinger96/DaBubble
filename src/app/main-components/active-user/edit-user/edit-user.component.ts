import { Component } from '@angular/core';
import { UserCardService } from '../services/user-card.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [NgClass],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss'
})
export class EditUserComponent {
  constructor(public usercardservice: UserCardService) {

  }
}

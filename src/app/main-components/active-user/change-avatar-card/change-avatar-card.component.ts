import { Component, Input } from '@angular/core';
import { UserCardService } from '../services/user-card.service';
import { NgClass } from '@angular/common';
import { User } from '../../../interfaces/user.interface';
@Component({
  selector: 'app-change-avatar-card',
  standalone: true,
  imports: [NgClass],
  templateUrl: './change-avatar-card.component.html',
  styleUrl: './change-avatar-card.component.scss'
})
export class ChangeAvatarCardComponent {
  @Input() actualUserUserCard: User[] = [];
 constructor(public usercardservice: UserCardService) {

  }
}

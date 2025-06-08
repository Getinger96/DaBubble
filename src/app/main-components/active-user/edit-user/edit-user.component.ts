import { Component, Input } from '@angular/core';
import { UserCardService } from '../services/user-card.service';
import { NgClass } from '@angular/common';
import { User } from '../../../interfaces/user.interface';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss'
})
export class EditUserComponent {
   @Input() actualUserUserCard: User[] = [];
   @Input() changedName!: string
  constructor(public usercardservice: UserCardService) {

  }
resetName() {
  this.usercardservice.changedName = this.usercardservice.name;
}
}

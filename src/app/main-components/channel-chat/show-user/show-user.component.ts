import { Component, Input , Inject } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import { User } from '../../../interfaces/user.interface';
import { NgIf, CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-show-user',
  standalone: true,
  imports: [MatCardModule, CommonModule],
  templateUrl: './show-user.component.html',
  styleUrl: './show-user.component.scss'
})
export class ShowUserComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { allUsersChannel: User[] }) {}

}

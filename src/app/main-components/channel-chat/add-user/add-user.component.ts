import { Component, Input , Inject } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import { User } from '../../../interfaces/user.interface';
import { NgIf, CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { Member } from '../../../interfaces/member.interface';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [MatCardModule, CommonModule],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss'
})
export class AddUserComponent {

  constructor(  public dialogRef: MatDialogRef<AddUserComponent>, @Inject(MAT_DIALOG_DATA) public data: { allUsersChannel: User[], members: Member[],currentChannelID: string   }) {
 
  }

  closeDialog() {
    this.dialogRef.close();
  }
}

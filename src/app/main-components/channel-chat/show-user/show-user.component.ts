import { Component, Input , Inject,Output, EventEmitter  } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import { User } from '../../../interfaces/user.interface';
import { NgIf, CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { Member } from '../../../interfaces/member.interface';
@Component({
  selector: 'app-show-user',
  standalone: true,
  imports: [MatCardModule, CommonModule],
  templateUrl: './show-user.component.html',
  styleUrl: './show-user.component.scss'
})
export class ShowUserComponent {
  @Output() addMemberClicked = new EventEmitter<void>();
  constructor(  public dialogRef: MatDialogRef<ShowUserComponent>, @Inject(MAT_DIALOG_DATA) public data: { allUsersChannel: User[], members: Member[], }) {
 
  }

  closeDialog() {
    this.dialogRef.close();
  }
  openAddUserDialog() {
    this.addMemberClicked.emit();
    this.dialogRef.close();
  }
}

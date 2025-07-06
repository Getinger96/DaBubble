import { Component,inject, Inject } from '@angular/core';
import { MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle, } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule, } from '@angular/material/card';  
import { CommonModule } from '@angular/common';
import { Member } from '../../../../interfaces/member.interface';
import { MainComponentService } from '../../../../firebase-services/main-component.service';
import { MainHelperService } from '../../../../services/main-helper.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { collection, doc, Firestore, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { User } from '../../../../interfaces/user.interface';
@Component({
  selector: 'app-open-profil',
  standalone: true,
  imports: [MatCardModule,CommonModule],
  templateUrl: './open-profil.component.html',
  styleUrl: './open-profil.component.scss'
})
export class OpenProfilComponent {

    userAvatar: number;
  userEmail: string;
  userName: string;
  userStatus: string;
  userId: string;
  firestore: Firestore = inject(Firestore);

constructor(@Inject(MAT_DIALOG_DATA) public data: User, public dialogRef: MatDialogRef<OpenProfilComponent>) {
this.userAvatar = data.avatar;
this.userEmail = data.email;
this.userName = data.name; 
this.userStatus = data.status;
this.userId = data.id;

}


    closeDialog() {
    this.dialogRef.close();
  }


  

}

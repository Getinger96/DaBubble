import { Component, Input , Inject,Output, EventEmitter, HostListener, OnInit,inject  } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import { User } from '../../../interfaces/user.interface';
import { NgIf, CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA,MatDialog } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { Member } from '../../../interfaces/member.interface';
import { OpenProfilComponent } from './open-profil/open-profil.component';
import { collection, doc, Firestore, getDoc, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { MainHelperService } from '../../../services/main-helper.service';
import { ProfileCardOverlayService } from '../../profile-card/profile-card-overlay.service';
@Component({
  selector: 'app-show-user',
  standalone: true,
  imports: [MatCardModule, CommonModule, OpenProfilComponent],
  templateUrl: './show-user.component.html',
  styleUrl: './show-user.component.scss'
})
export class ShowUserComponent implements OnInit {
  @Output() addMemberClicked = new EventEmitter<void>();
  @Output() openProfil = new EventEmitter<void>();
  firestore: Firestore = inject(Firestore);
selectedUser: User | null = null;

  readonly dialog = inject(MatDialog);
  constructor(  public dialogRef: MatDialogRef<ShowUserComponent>, @Inject(MAT_DIALOG_DATA) public data: { allUsersChannel: User[], members: Member[],  }, public mainHelperService : MainHelperService,
   public profileCardOverlayService: ProfileCardOverlayService) {
 
  }



  ngOnInit(): void {
    this.checkWidth()
  }

    @HostListener('window:resize', ['$event'])
    onResize(event: Event) {
      this.checkWidth()
    }



    checkWidth()  {
      if (window.matchMedia('(max-width: 900px)').matches) {
         this.closeDialog();
      }
    }
  

  closeDialog() {
    this.dialogRef.close();
  }
  openAddUserDialog() {
    setTimeout(() => {
          this.addMemberClicked.emit();

    }, 100);
     this.closeDialog();
  }


async openProfilCard(member: Member) {
  let user = await this.getDataFormFirebase(member);
  this.selectedUser = {
    id: member.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    status: user.status,
    uid: '', 
    passwort: ''
  };
  this.mainHelperService.showProfilCard = true;
}

async getDataFormFirebase(member:Member) {
const userId = member.id
const userRef = doc(this.firestore, 'Users', userId);
const userDocSnap = await getDoc(userRef);
let userData = userDocSnap.data();
return { 
  name: userData!['name'], 
  email: userData!['email'],
  avatar: userData!['avatar'],
  status: userData!['status'],
}

}


reloadSelectedUser() {
   this.selectedUser = null;
}


}

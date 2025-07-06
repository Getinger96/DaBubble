import { Component,inject, Inject, Input, OnInit, Output,EventEmitter  } from '@angular/core';
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
export class OpenProfilComponent implements OnInit {
  @Input() user: User | null = null;
  userAvatar: number = 0;
  userEmail: string = '';
  userName: string = '';
  userStatus: string = '';
  userId: string = '';
  @Output() userCard = new EventEmitter<void>();
  @Output() closeCard = new EventEmitter<void>();
  firestore: Firestore = inject(Firestore);


  constructor(public mainHelperService: MainHelperService, public mainServie: MainComponentService) {}

  ngOnInit(): void {
    if (this.user) {
      this.userAvatar = this.user.avatar;
      this.userEmail = this.user.email;
      this.userName = this.user.name;
      this.userStatus = this.user.status;
      this.userId = this.user.id;
    }
  }



closeprofilcard() {
this.mainHelperService.showProfilCard = false 
this.userCard.emit();
}


   opendirectChat(id: string,name: string, close: boolean, avatar: number, email: string, status: string) {

    this.mainServie.showdirectmessage = true
    this.mainHelperService.openChannelSection(close)
    this.mainServie.setDirectmessageuserName(name)
    this.mainServie.setDirectmessageuserEmail(email)
    this.mainServie.setDirectmessageuserAvatar(avatar)
    this.mainServie.setDirectmessageuserStatus(status)
    this.mainServie.setDirectmessageuserId(id)
   this.mainHelperService.showProfilCard = false 
   this.closeCard.emit();
  }

  

}

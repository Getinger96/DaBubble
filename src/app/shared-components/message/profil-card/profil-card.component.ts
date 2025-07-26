import { Component, Inject, OnInit, HostListener, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { User } from '../../../interfaces/user.interface';
import { MainHelperService } from '../../../services/main-helper.service';
import { Subscription } from 'rxjs';
import { MainComponentService } from '../../../firebase-services/main-component.service';

@Component({
  selector: 'app-profil-card',
  standalone: true,
  imports: [MatCardModule,CommonModule],
  templateUrl: './profil-card.component.html',
  styleUrl: './profil-card.component.scss'
})
export class ProfilCardComponent implements OnInit {
  userAvatar: number;
  userEmail: string;
  userName: string;
  userStatus: string;
  userId: string;
  actualUser: User[] = [];
  private usersSubscription!: Subscription;
  private actualUserSubscription!: Subscription;
  @ViewChild('profilcard') profilcard!: ElementRef<HTMLTextAreaElement>
  @Output() showProfilCard = new EventEmitter<boolean>();
  toDirectChat: boolean =false;
  constructor(private mainservice: MainComponentService,
     private mainhelperService: MainHelperService,
    public dialogRef: MatDialogRef<ProfilCardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      userStatus: string,
      userEmail: string,
      userName: string,
      userId: string,
      userAvatar: number
    }
  ) {
    this.userAvatar = data.userAvatar;
    this.userEmail = data.userEmail;
    this.userName = data.userName;
    this.userStatus = data.userStatus;
    this.userId = data.userId;
  }

    ngOnInit(): void {

  this.loadActualUser()


  }

    @HostListener('document:click', ['$event'])
    handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
  
      const clickedInside=
        this.profilcard?.nativeElement.contains(target)
  
  
      if (!clickedInside) {
        this.mainhelperService.ToDirectChat =false 
        this.showProfilCard.emit(false);
      }
  
  
    }
  



    loadActualUser() {
    this.actualUserSubscription = this.mainservice.acutalUser$.subscribe(actualUser => {
      if (actualUser.length > 0) {
        this.actualUser = actualUser
      }
    });
    
  }
   opendirectChat(id: string,name: string, close: boolean, avatar: number, email: string, status: string) {

       if (!this.actualUser || this.actualUser.length === 0) {
      console.warn('actualUser not loaded yet');
      return;
    }

     this.mainservice.showdirectmessage = true
    this.mainhelperService.openChannelSection(close)
    this.mainservice.setDirectmessageuserName(name)
    this.mainservice.setDirectmessageuserEmail(email)
    this.mainservice.setDirectmessageuserAvatar(avatar)
    this.mainservice.setDirectmessageuserStatus(status)
    this.mainservice.setDirectmessageuserId(id)

    this.closeDialog()
  }




    closeDialog() {
     this.mainhelperService.ToDirectChat =false 
    this.dialogRef.close();
  }
}

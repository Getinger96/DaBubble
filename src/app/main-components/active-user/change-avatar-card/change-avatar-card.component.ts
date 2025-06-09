import { Component, Input, OnInit , AfterViewInit, SimpleChanges, OnChanges} from '@angular/core';
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
export class ChangeAvatarCardComponent implements OnChanges{
  @Input() actualUserUserCard: User[] = [];
  disabledButton:boolean = false;
  newAvatarImg!: number
 constructor(public usercardservice: UserCardService) {

  }

ngOnChanges(changes: SimpleChanges) {
  if (this.actualUserUserCard && this.actualUserUserCard.length > 0) {
    this.newAvatarImg = this.actualUserUserCard[0].avatar;


    if (!this.usercardservice.overlayEditChangAvatar ) {
          this.newAvatarImg = this.actualUserUserCard[0].avatar;
    }
  }
}


resetAvatarSelection() {
   if (!this.usercardservice.overlayEditChangAvatar ) {
          this.newAvatarImg = this.actualUserUserCard[0].avatar;
          this.disabledButton = false;
    }
}

  changeAvatarImg(newAvatarImgSelection:number) {
    this.disabledButton = true;
    this.newAvatarImg = newAvatarImgSelection


  }
}

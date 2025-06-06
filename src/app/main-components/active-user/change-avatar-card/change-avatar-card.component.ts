import { Component, Input, OnInit , AfterViewInit} from '@angular/core';
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
export class ChangeAvatarCardComponent implements AfterViewInit{
  @Input() actualUserUserCard: User[] = [];
  disabledButton:boolean = false;
  newAvatarImg!: number
 constructor(public usercardservice: UserCardService) {

  }


  ngAfterViewInit(): void {
    this.newAvatarImg = this.actualUserUserCard[0].avatar 
    
  }


  changeAvatarImg(newAvatarImgSelection:number) {
    this.disabledButton = true;
    this.newAvatarImg = newAvatarImgSelection


  }
}

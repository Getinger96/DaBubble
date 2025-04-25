import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RegisterService } from '../../../firebase-services/register.service';
import { Subscription } from 'rxjs';
import { User } from '../../../interfaces/user.interface';
import { MainComponentService } from '../../../firebase-services/main-component.service';
import { NgClass } from '@angular/common';
import { UserCardService } from '../services/user-card.service';

@Component({
  selector: 'app-user-card-menu',
  standalone: true,
  imports: [NgClass],
  templateUrl: './user-card-menu.component.html',
  styleUrl: './user-card-menu.component.scss'
})

export class UserCardMenuComponent implements OnInit {

  constructor(private route: ActivatedRoute, public registerService: RegisterService,private mainservice:MainComponentService, public usercardservice: UserCardService) { }
  avatar?:number;
  name?:string;
  email?:string;
  id? : string // automatische generierte id von Firebase
  private actualUserSubscription!: Subscription;
  actualUser: User[] = [];
  @Input() userId?:string
  @Input() actualUserUserCard: User[] = [];
  @Input() showUserCard?: boolean;
  @Output() closeCard = new EventEmitter<boolean>();

  ngOnInit() {

        console.log('actualUserUserCard', this.actualUserUserCard);
  if (this.actualUserUserCard.length > 0) {
    const user = this.actualUserUserCard[0];
    this.avatar = user.avatar;  
    this.name = user.name;     
    this.email = user.email;   
    this.id = user.id;   
  }
    
  }
  close(event: Event) {
    if (event) {
      this.closeCard.emit(false);
    }
 
  }

}
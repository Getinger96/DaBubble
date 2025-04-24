import { Component, EventEmitter, OnInit, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  imports: [RouterLink, NgClass],
  templateUrl: './user-card-menu.component.html',
  styleUrl: './user-card-menu.component.scss'
})

export class UserCardMenuComponent implements OnInit {

  constructor(private route: ActivatedRoute, public registerService: RegisterService,private mainservice:MainComponentService, public usercardservice: UserCardService) { }
  avatar?:number;
  name?:string;
  email?:string;
  private usersSubscription!: Subscription;
  actualUser: User[] = [];
  @Input() userId?:string


  ngOnInit() {
    this.usersSubscription = this.mainservice.allUsers$.subscribe(users => {
      this.actualUser = users;
    });

    if (this.userId && this.actualUser.length > 0) {
      const user = this.actualUser.find(u => u.id === this.userId);
      if (user) {
        this.name = user.name;
        this.email = user.email;
        this.avatar = user.avatar;
      }
    }
  }
}
import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { NgIf,CommonModule } from '@angular/common';
import { User } from '../../../interfaces/user.interface';
import { RegisterService } from '../../../firebase-services/register.service';
import { LoadingService } from '../../../services/loading.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-direct-message-user',
  standalone: true,
  imports: [NgIf,CommonModule],
  templateUrl: './direct-message-user.component.html',
  styleUrl: './direct-message-user.component.scss'
})
export class DirectMessageUserComponent implements OnInit {


  @Input() ownAccount!:boolean;
  @Input() userArray!: User[];
  private usersSubscription!: Subscription;
  constructor(private registerservice: RegisterService, private loadingService : LoadingService){

  }

  ngOnInit(): void {
 
  }
}

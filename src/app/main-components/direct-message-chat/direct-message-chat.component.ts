import { Component } from '@angular/core';
import { MainComponentService } from '../../firebase-services/main-component.service';
import { NgIf,CommonModule } from '@angular/common';
import { UserCardService } from '../active-user/services/user-card.service';

@Component({
  selector: 'app-direct-message-chat',
  standalone: true,
  imports: [NgIf,CommonModule],
  templateUrl: './direct-message-chat.component.html',
  styleUrl: './direct-message-chat.component.scss'
})
export class DirectMessageChatComponent {
currentmessageUser:string='';
currentmessageEmail:string='';
currentmessageAvatar:any;
currentmessageStatus:string='';
overlayvisible:boolean=false;

constructor(private mainservice: MainComponentService, public usercardservice: UserCardService) {

}

  ngOnInit():void{
    this.loadName()
    this.loadAvatar()
    this.loadEmail()
    this.loadStatus()
  }

  loadName(){
    this.mainservice.currentusermessageName$.subscribe(name=>{
      this.currentmessageUser=name
    })
  }
  loadEmail(){
    this.mainservice.currentusermessagEmail$.subscribe(email=>{
      this.currentmessageEmail=email
    })
  }
  loadAvatar(){
    this.mainservice.currentusermessagAvatar$.subscribe(avatar=>{
      this.currentmessageAvatar=avatar
    })
  }
  loadStatus(){
    this.mainservice.currentusermessagStatus$.subscribe(status=>{
      this.currentmessageStatus=status
    })
  }

  closeOverlay(){
this.overlayvisible=false;
  }

  openOverlay(){
this.overlayvisible=true
  }
}

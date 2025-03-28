import { Component } from '@angular/core';
import { HeaderComponent } from "../../shared-components/header/header.component";
import { CommonModule } from '@angular/common';
import { User } from '../../interfaces/user.interface';
import { RegisterService } from '../../firebase-services/register.service';
import { GoogleAuthProvider } from "firebase/auth";
@Component({
  selector: 'app-choose-avatar',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './choose-avatar.component.html',
  styleUrl: './choose-avatar.component.scss'
})
export class ChooseAvatarComponent {

avatarImgNumber : number = 1;


constructor(public registerservice: RegisterService) {

}
avatarSelection(imgNumber: number) {
      this.avatarImgNumber = imgNumber;
}


SelectAvatarImg() {
  this.registerservice.updateUserAvatar(this.avatarImgNumber)
}
}

import { Injectable, inject } from '@angular/core';
import { MainComponentService,  } from '../../../firebase-services/main-component.service';
import { Subscription } from 'rxjs';
import { User } from '../../../interfaces/user.interface';
import { ActivatedRoute } from '@angular/router';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { ChannelService } from '../../../firebase-services/channel.service';
import { ChannelMessageService } from '../../../firebase-services/channel-message.service'; 
@Injectable({
  providedIn: 'root'
})
export class UserCardService {
  private usersSubscription!: Subscription;
  private actualUserSubscription!: Subscription;
  overlayUserCardActive: boolean = false;
  overlayEditUserActive: boolean = false;
  userId?:string;
  avatar?:number;
  name?:string;
  email?:string;
  actualUser: User[] = [];
  changedName?:string;

  private route = inject(ActivatedRoute);
  private firestore = inject(Firestore)

  constructor(
    private mainservice:MainComponentService, private channelService: ChannelService, private channelMessageService: ChannelMessageService
  ) 
  {
      this.actualUserSubscription = this.mainservice.acutalUser$.subscribe(actualUser => {
        if (actualUser.length > 0) {
          this.actualUser = actualUser;
          this.userId = actualUser[0].id;
          this.name = actualUser[0].name;
          this.email = actualUser[0].email;
          this.avatar = actualUser[0].avatar;
        }
      });
    }

  async saveName(nameInput:string, nameBefore:string): Promise<void> {

    if (nameBefore) {
    console.log(nameInput, this.userId, nameBefore);
    const userDocRef = doc(this.firestore, `Users/${this.userId}`);
    await updateDoc(userDocRef, { name: nameInput });
    this.mainservice.subList();
    this.channelService.subChannelList();
    this.channelService.updateUserNameInChannels(nameInput, nameBefore )

    if (this.userId) {
      this.channelMessageService.updateName(nameInput, this.userId, nameBefore)
        }
  }
}
}
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MainHelperService {
    public showChannel = new BehaviorSubject  < boolean>(false);
    openChannel$ = this.showChannel.asObservable();
    openChannel: boolean = true;
    showEditMessage: boolean = false
    showMemberList: boolean = false
    openNewChat:boolean =false
  constructor() { }


openChannelSection(openChannel: boolean) {
this.setChannel(openChannel)
  this.showChannel.next(this.openChannel);
  console.log('this.openChannel', this.openChannel);
  
}


setChannel(openChannel: boolean) {
  return this.openChannel = openChannel;
}


}
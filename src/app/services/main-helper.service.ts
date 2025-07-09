import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MainHelperService {
    public showChannel = new BehaviorSubject <boolean>(false);
    openChannel$ = this.showChannel.asObservable();
    openChannel: boolean = true;
    showEditMessage: boolean = false;
    showMemberList: boolean = false;
    openNewChat:boolean = false;
    openThreadSeachBar:boolean =false;
    focusDirectMessage$ = new Subject<void>();
    focusChannelMessage$ = new Subject<void>();
    showProfilCard: boolean = true;
    channelNames: any[] = [];
    ToDirectChat: boolean = false;
  constructor() { }


  openChannelSection(openChannel: boolean) {
    this.setChannel(openChannel)
    this.showChannel.next(this.openChannel);

  }


  setChannel(openChannel: boolean) {
    return this.openChannel = openChannel;
  }



}
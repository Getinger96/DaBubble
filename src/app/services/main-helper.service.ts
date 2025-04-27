import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MainHelperService {
    private showChannel = new BehaviorSubject  < boolean>(false);
    openChannel$ = this.showChannel.asObservable();
    openChannel!: boolean

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
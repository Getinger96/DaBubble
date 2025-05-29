import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ProfileCardOverlayService {

  overlayActive$ = new BehaviorSubject<boolean>(false);

  constructor() { }

  openProfileCard() {
   this.overlayActive$.next(true);
  }

  closeProfileCard() {
   this.overlayActive$.next(false);
  }

}

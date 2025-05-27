import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProfileCardOverlayService {

  overlayActive: boolean = false;

  constructor() { }

  openProfileCard() {
    this.overlayActive = true;
  }

  closeProfileCard() {
    this.overlayActive = false;
  }

}

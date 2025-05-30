import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Component, Input, Output, EventEmitter, } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class ProfileCardOverlayService {

  overlayActive$ = new BehaviorSubject<boolean>(false);
  @Output() profileClosed = new EventEmitter<void>();

  constructor() { }

  openProfileCard() {
   this.overlayActive$.next(true);
  }

  closeProfileCard() {
  this.profileClosed.emit();
  this.overlayActive$.next(false);
  }

}

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogoutService {

  // private timeoutId: any;
  // private idleTimeout = 1 * 60 * 1000;
  // private userActivitySubject = new Subject<void>();

  // constructor(private router: Router) {
  //   this.resetTimer();
  // }

  // public resetTimer() {
  //   if (this.timeoutId) {
  //     clearTimeout(this.timeoutId);
  //   }

  //   this.timeoutId = setTimeout(() => {
  //     this.logOut();
  //   }, this.idleTimeout);

  //   window.addEventListener('mousemove', this.resetTimer.bind(this));
  //   window.addEventListener('keydown', this.resetTimer.bind(this));
  // }

  // private logOut() {
  //   console.log('Benutzer ist inaktiv, bitte ausloggen.');
  //   this.router.navigate(['/login']);
  // }

  // // Optionale Methode, um Inaktivitätsereignisse nach außen zu streamen
  // public getUserActivityObservable() {
  //   return this.userActivitySubject.asObservable();
  // }
}

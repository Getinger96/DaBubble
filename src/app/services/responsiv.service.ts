import { Injectable, ChangeDetectorRef, ApplicationRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResponsivService {

  private mediaQueryTablet = window.matchMedia('(max-width: 768px)');
  private mediaQueryMobile = window.matchMedia('(max-width: 480px)');
  isResponsiv: boolean = false;
  isMobile: boolean = false;
  workspace: boolean = true;

  constructor(private appRef: ApplicationRef) {
    this.handleMediaChange(this.mediaQueryTablet);
    this.handleMobileChange(this.mediaQueryMobile);
    this.mediaQueryTablet.addEventListener('change', this.handleMediaChange.bind(this));
    this.mediaQueryMobile.addEventListener('change', this.handleMobileChange.bind(this));
  }

  handleMediaChange(e: MediaQueryListEvent | MediaQueryList) {
    this.isResponsiv = e.matches;
    this.appRef.tick();
    if (e.matches) {
    }
  }

  handleMobileChange(e: MediaQueryListEvent | MediaQueryList) {
    this.isMobile = e.matches;
    this.appRef.tick();
    if (e.matches) {
    }
  }

}
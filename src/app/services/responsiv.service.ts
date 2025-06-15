import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResponsivService {

  private mediaQuery = window.matchMedia('(max-width: 768px)');
  isResponsiv: boolean = false;
  workspace: boolean = true;

  constructor() {
    this.handleMediaChange(this.mediaQuery);
    this.mediaQuery.addEventListener('change', this.handleMediaChange.bind(this));
  }

  handleMediaChange(e: MediaQueryListEvent | MediaQueryList) {
    console.log('unter 768px');
  }

}

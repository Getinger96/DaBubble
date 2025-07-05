import { Component, Output, EventEmitter } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { MainComponentsComponent } from '../main-components.component';
import { ResponsivService } from '../../services/responsiv.service';

@Component({
  selector: 'app-toggle-webspace-menu',
  standalone: true,
  imports: [NgIf, NgClass],
  templateUrl: './toggle-webspace-menu.component.html',
  styleUrl: './toggle-webspace-menu.component.scss'
})

export class ToggleWebspaceMenuComponent {
  mainComponents = MainComponentsComponent;
  isWorkspaceOpen: boolean = true;
  mobile: boolean = false;
  @Output() closeToggleWorkspace  = new EventEmitter<boolean>();
  private mediaQuery = window.matchMedia('(max-width: 900px)');

  constructor(public responsivService: ResponsivService) {
    this.handleMediaChange(this.mediaQuery);
    this.mediaQuery.addEventListener('change', this.handleMediaChange.bind(this));
  }

   toggleWorkspace(){
    this.mainComponents.toggleWorkspace();
    if(this.isWorkspaceOpen) {
      this.isWorkspaceOpen = false;
      this.responsivService.workspace = false;
    } else if(!this.isWorkspaceOpen) {
      this.isWorkspaceOpen = true;
      this.responsivService.workspace = true;
    }
  }


  handleMediaChange(e: MediaQueryListEvent | MediaQueryList) {
    this.mobile = e.matches;
    if (e.matches) {
      this.isWorkspaceOpen = false;
    }
  }

}

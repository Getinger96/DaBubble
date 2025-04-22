import { Component, Output } from '@angular/core';
import { NgIf, NgStyle } from '@angular/common';
import { MainComponentsComponent } from '../main-components.component';

@Component({
  selector: 'app-toggle-webspace-menu',
  standalone: true,
  imports: [NgIf, NgStyle],
  templateUrl: './toggle-webspace-menu.component.html',
  styleUrl: './toggle-webspace-menu.component.scss'
})

export class ToggleWebspaceMenuComponent {
  mainComponents = MainComponentsComponent;
  isWorkspaceOpen:boolean = true;

 toggleWorkspace(){
    this.mainComponents.toggleWorkspace();
    if(this.isWorkspaceOpen) {
      this.isWorkspaceOpen = false;
    } else if(!this.isWorkspaceOpen) {
      this.isWorkspaceOpen = true;
    }
  }

}

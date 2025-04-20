import { Component, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { MainComponentsComponent } from '../main-components.component';

@Component({
  selector: 'app-toggle-webspace-menu',
  standalone: true,
  imports: [NgIf],
  templateUrl: './toggle-webspace-menu.component.html',
  styleUrl: './toggle-webspace-menu.component.scss'
})
export class ToggleWebspaceMenuComponent {


  mainComponents = MainComponentsComponent;

 toggleWorkspace(){
    this.mainComponents.toggleWorkspace();
  }

}

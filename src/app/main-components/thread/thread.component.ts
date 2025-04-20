import { Component } from '@angular/core';
import { MessageComponent } from '../../shared-components/message/message.component';
import { CommonModule } from '@angular/common';
import { MainComponentsComponent } from '../main-components.component';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [MessageComponent, CommonModule],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

  mainComponents = MainComponentsComponent;

  closeThreads(){
    this.mainComponents.toggleThreads();
  }
}

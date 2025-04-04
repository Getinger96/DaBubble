import { Component } from '@angular/core';
import { MessageComponent } from '../../shared-components/message/message.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [MessageComponent, CommonModule],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

}

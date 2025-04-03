import { Component } from '@angular/core';
import { MessageComponent } from '../../shared-components/message/message.component';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [MessageComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

}

import { Component } from '@angular/core';
import { EditMessageHoverBoxComponent } from './edit-message-hover-box/edit-message-hover-box.component';

@Component({
  selector: 'app-message-action-box',
  standalone: true,
  imports: [EditMessageHoverBoxComponent],
  templateUrl: './message-action-box.component.html',
  styleUrl: './message-action-box.component.scss'
})
export class MessageActionBoxComponent {

}

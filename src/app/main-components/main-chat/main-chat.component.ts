import { Component } from '@angular/core';
import { MessageComponent } from '../../shared-components/message/message.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-chat',
  standalone: true,
  imports: [MessageComponent, CommonModule],
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.scss'
})
export class MainChatComponent {

}

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {
@Input() date!: string;
@Input() avatarSrc!: string;
@Input() name!: string;
@Input() time!: string;
@Input() message!: string;
@Input() isOwn: boolean | undefined = false;
@Input() isThread: boolean | undefined = false;
@Input() isInThread: boolean | undefined = false;
@Input() isAnswered: boolean | undefined = false;

showEditMessage(){
  let editMessagePopup = document.getElementById('editMessagePopup');
  if (editMessagePopup) {
    editMessagePopup.style.display = 'flex';
  } else {
    console.error('Element with id "editMessagePopup" not found.');
  }
}

hideEditMessage(){
  let editMessagePopup = document.getElementById('editMessagePopup');
  if (editMessagePopup) {
    editMessagePopup.style.display = 'hide';
  } else {
    console.error('Element with id "editMessagePopup" not found.');
  }
}
}




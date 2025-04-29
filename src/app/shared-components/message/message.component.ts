import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MessageService } from '../../firebase-services/message.service';
import { Message } from '../../interfaces/message.interface';
import { DatePipe } from '@angular/common';
import { MainComponentsComponent } from '../../main-components/main-components.component';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {
  @Input() date!: Date | string;
  @Input() avatarSrc!: number;
  @Input() name!: string;
  @Input() time!: Date | string;
  @Input() messageText!: string;
  @Input() reaction!: number;
  @Input() isOwn: boolean | undefined = false;
  @Input() isThread: boolean | undefined = false;
  @Input() isInThread: boolean | undefined = false;
  @Input() isAnswered: boolean | undefined = false;
  id?:string = this.messageService.id;

  mainComponents = MainComponentsComponent;

  constructor(private messageService: MessageService){}

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

  openThreads(){
    this.mainComponents.toggleThreads();
  }

  addNewReaction(reaction:string) {
    console.log(this.id, reaction, this.messageService.allMessages);
  }

}


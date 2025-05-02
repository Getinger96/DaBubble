import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Message } from '../../interfaces/message.interface';
import { MessageComponent } from '../../shared-components/message/message.component';
import { CommonModule } from '@angular/common';
import { MainComponentsComponent } from '../main-components.component';
import { MessageService } from '../../firebase-services/message.service';
import { MainComponentService } from '../../firebase-services/main-component.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [MessageComponent, CommonModule, FormsModule],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

  @Input() parentMessage: Message| null = null;
  @Output() closeThread = new EventEmitter<void>();
  mainComponents = MainComponentsComponent;

  threadAnswers : Message[] = [];
  newThreadText: string = '';

  constructor(public messageService: MessageService, private mainService: MainComponentService){
  }

  ngOnInit(): void{
    if (this. parentMessage?.id){
      this.loadThreadAnswers();
    }
  }

  loadThreadAnswers(): void{
    if(this.parentMessage?.id){
      this.threadAnswers = this.messageService.getThreadAnswers(this.parentMessage.id);
    }
  }

  closeThreads():void{
    this.mainComponents.toggleThreads();
    this.closeThread.emit();
  }

  async sendReply(): Promise<void> {
    if (!this.newThreadText.trim() || !this.parentMessage?.id) return;
    
    await this.messageService.addThreadAnswer(this.newThreadText, this.parentMessage.id);
    this.newThreadText = '';
    this.loadThreadAnswers();
  }
}

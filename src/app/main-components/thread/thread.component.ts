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

  @Input() message: Message| null = null;
  @Output() openThread = new EventEmitter<void>();
  @Output() closeThread = new EventEmitter<void>();
  mainComponents = MainComponentsComponent;

  threadAnswers : Message[] = [];
  newThreadText: string = '';

  constructor(private messageService: MessageService, private mainService: MainComponentService){
  }

  ngOnInit(): void{
    if (this. message?.messageId){
      this.openThread.emit();
      this.loadThreadAnswers();
    }
  }


  loadThreadAnswers(): void{
    if(this.message?.messageId){
      this.threadAnswers = this.messageService.getThreadAnswers(this.message.messageId);
    }
  }

  closeThreads():void{
    this.mainComponents.toggleThreads();
    this.closeThread.emit();
  }

  async sendReply(): Promise<void> {
    if (!this.newThreadText.trim() || !this.message?.messageId) return;
    
    await this.messageService.addThreadAnswer(this.newThreadText, this.message.messageId);
    this.newThreadText = '';
    this.loadThreadAnswers();
  }
}

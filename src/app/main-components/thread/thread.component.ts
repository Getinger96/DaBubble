import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Message } from '../../interfaces/message.interface';
import { MessageComponent } from '../../shared-components/message/message.component';
import { CommonModule } from '@angular/common';
import { MainComponentsComponent } from '../main-components.component';
import { MessageService } from '../../firebase-services/message.service';
import { MainComponentService } from '../../firebase-services/main-component.service';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [MessageComponent, CommonModule, FormsModule],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss',
})
export class ThreadComponent {
  @Input() selectedMessage: Message | null = null;
  @Output() openThread = new EventEmitter<void>();
  @Output() closeThread = new EventEmitter<void>();
  mainComponents = MainComponentsComponent;
  private allThreadsSubscription!: Subscription;
  @ViewChild('threadFeed') private threadFeed!: ElementRef;

  threadAnswers: Message[] = [];
  private selectedMessageSubscription!: Subscription;
  private threadRepliesSubscription!: Subscription;
  newThreadText: string = '';

  constructor(
    public messageService: MessageService,
    private mainService: MainComponentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.selectedMessageSubscription =
      this.messageService.selectedThreadMessage$.subscribe((message) => {
        console.log('Selected message updated:', message);
        this.selectedMessage = message;

        if (message?.messageId) {
          this.loadThreadAnswers();
        }
      });

    this.threadRepliesSubscription =
      this.messageService.threadReplies$.subscribe((replies) => {
        console.log('Thread replies updated:', replies);
        this.threadAnswers = replies;
      });

    setTimeout(() => this.scrollToBottom(), 0);
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
    this.cdr.detectChanges();
    
  }

  scrollToBottom(): void {
    try {
      this.threadFeed.nativeElement.scrollTop = this.threadFeed.nativeElement.scrollHeight;
    } catch (err) { }
  }

  loadThreadAnswers(): void {
    this.allThreadsSubscription = this.messageService.allMessages$.subscribe(
      (messages) => {
        this.threadAnswers = messages.filter((message) => message.isThread);
        if (this.selectedMessage?.messageId) {
          this.threadAnswers = this.messageService.getThreadAnswers(
            this.selectedMessage.messageId
          );
        };

      }
    );
    
  }

  closeThreads(): void {
    this.mainComponents.toggleThreads();
    this.closeThread.emit();
  }

  async sendReply(): Promise<void> {
    if (!this.newThreadText.trim() || !this.selectedMessage?.messageId) return;
    await this.messageService.addThreadAnswer(
      this.newThreadText,
      this.selectedMessage.messageId
    );
    this.newThreadText = '';
    this.loadThreadAnswers();
    this.messageService.sortAllMessages(this.threadAnswers);
  }

  ngOnDestroy(): void {
    if (this.allThreadsSubscription) {
      this.allThreadsSubscription.unsubscribe();
    }
  }
}

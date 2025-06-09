import { Component, HostListener, ViewChild, ElementRef, Input, inject,Output,EventEmitter  } from '@angular/core';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { CommonModule, NgIf,} from '@angular/common';
import { MainHelperService } from '../../../services/main-helper.service';
import { ChannelMessageService } from '../../../firebase-services/channel-message.service';
import { Firestore, collection, QuerySnapshot, getDocs, addDoc, updateDoc, doc,collectionGroup, DocumentData, writeBatch, onSnapshot, Query, deleteDoc, query, where, getDoc } from '@angular/fire/firestore';
import { Message } from '../../../interfaces/message.interface';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-edit-message',
  standalone: true,
  imports: [PickerComponent,CommonModule,FormsModule ],
  templateUrl: './edit-message.component.html',
  styleUrl: './edit-message.component.scss'
})
export class EditMessageComponent {
toggleEmoji: boolean = false
textEdit: string = '';;
@ViewChild('emojiImg') emojiImg!: ElementRef<HTMLTextAreaElement>
@ViewChild('emojiComponent') emojiComponent!: ElementRef<HTMLTextAreaElement>
@Input() messageTextEdit!: string;
@Input() messageEditId!:string;
@Input() channelID!:string
mainHelperService = inject(MainHelperService);
channelMessageService = inject(ChannelMessageService);
firestore: Firestore = inject(Firestore);
@Output() cancelEdit = new EventEmitter;


    addEmoji(event: any) {
    const emoji = event.emoji.native;
    this.textEdit += emoji;

  }
  
    @HostListener('document:click', ['$event'])
    handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
  
      const clickedInsideEmojiEdit =
        this.emojiComponent?.nativeElement.contains(target) || this.emojiImg?.nativeElement.contains(target)
  
  
      if (!clickedInsideEmojiEdit) {
        this.toggleEmoji = false;
      }
  
  
    }
  

  showEmojiBar() {
    this.toggleEmoji= true
  }

  closeEditMessageText() {
    this.cancelEdit.emit();
  }
async editMessage(messageId: string, channelId: string) {
  if (!this.messageEditId || !this.channelID) return;

  const { sendAt, sendAtTime } = this.getFormattedDateAndTime();

  try {
    const messageRefDoc = doc(this.firestore, 'Channels', channelId, 'messages', messageId);
    await updateDoc(messageRefDoc, {
      messageText: this.textEdit,
      sendAt,
      sendAtTime,
    });

    this.channelMessageService.subList(channelId);
    this.cancelEdit.emit();
  } catch (error) {
  }
}

getFormattedDateAndTime(): { sendAt: string, sendAtTime: string } {
  const now = new Date();
  const locale = 'de-DE';

  const sendAtTime = now.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const weekday = now.toLocaleDateString(locale, { weekday: 'long' });
  const day = now.getDate();
  const month = now.toLocaleDateString(locale, { month: 'long' });

  const sendAt = `${weekday}, ${day}. ${month}`;

  return { sendAt, sendAtTime };
}


}

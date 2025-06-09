import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnChanges, ViewChild, ElementRef, HostListener, SimpleChanges, input, OnInit, inject } from '@angular/core';
import { MessageService } from '../../firebase-services/message.service';
import { MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle, } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MainComponentService } from '../../firebase-services/main-component.service';
import { Message } from '../../interfaces/message.interface';
import { DatePipe } from '@angular/common';
import { MainComponentsComponent } from '../../main-components/main-components.component';
import { Subscription, combineLatest, BehaviorSubject } from 'rxjs';
import { ChannelMessageService } from '../../firebase-services/channel-message.service';
import { ChannelService } from '../../firebase-services/channel.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { ProfilCardComponent } from './profil-card/profil-card.component';
import { ProfileCardOverlayService } from '../../main-components/profile-card/profile-card-overlay.service';
import { take } from 'rxjs/operators';
import { doc, updateDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { EditMessageComponent } from './edit-message/edit-message.component';
import { MainHelperService } from '../../services/main-helper.service';
@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, FormsModule, PickerComponent, MatCardModule, MatButtonModule, EditMessageComponent],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss',
})
export class MessageComponent implements OnChanges {
  @Input() messageData: Message | undefined;
  @Input() date!: Date | string | null;
  @Input() avatarSrc!: number;
  @Input() name!: string;
  @Input() time!: Date | string;
  @Input() messageText!: string;
  @Input() reaction!: number;
  @Input() isOwn: boolean | undefined = false;
  @Input() isThread: boolean | undefined = false;
  @Input() isInThread: boolean | undefined = false;
  @Input() isAnswered: boolean | undefined = false;
  @Input() threadCount: number = 0;
  @Input() threadTo!: string;
  @Input() dateExists: boolean | undefined = false;
  @Input() lastAnswerDate!: string;
  @Input() channelIdThread!: string;
  @Input() threadAnswersId!: string
  @Input() threadAnswersUserId!: string
  @Input() channelID!: string;
  @Input() selectedMessageId!: string;
  @Input() selectedChannelId!: string;
  @Input() selectedUserId!: string;
  @Input() emojiReactionsThead?: { [emoji: string]: { count: number; users: string[] } };
  @Input() isThreadRootMessage: boolean = false;
  @ViewChild('emojiComponent') emojiComponent!: ElementRef<HTMLTextAreaElement>
  @ViewChild('emojiImg') emojiImg!: ElementRef<HTMLTextAreaElement>
  @ViewChild('emojiImgWriter') emojiImgWriter!: ElementRef<HTMLTextAreaElement>
  @ViewChild('emojiThreadMask') emojiThreadMask!: ElementRef<HTMLTextAreaElement>
  @ViewChild('emojiThread') emojiThread!: ElementRef<HTMLTextAreaElement>
  mainComponents = MainComponentsComponent;
  private allThreadsSubscription!: Subscription;
  allMessages: Message[] = []
  threadAnswers: Message[] = [];
  isEditPopupOpened: boolean = false;
  showProfil: boolean = false;
  editMessage: boolean = false;
  showEditPopup: boolean = false;
  emojiReactions = new Map<string, { count: number, users: string[] }>();
  showEmojiPicker: boolean = false;
  showEmojiPickerThread: boolean = false;
  hover = false;

  currentChannelId?: string
  userId!: string
  userStatus!: string
  userEmail!: string
  userAvatar!: number | null;
  readonly dialog = inject(MatDialog);
  userName!: string
  message: Message[] = [];
  userDataReady$ = new BehaviorSubject<boolean>(false);
  profileCardKey = '';
  editedMessageText: string = '';
 editMessageId: string | null = null;

  constructor(private messageService: MessageService, private channelmessageService: ChannelMessageService, private channelService: ChannelService, private mainService: MainComponentService, public profilecardservice: ProfileCardOverlayService,
    public mainHelperService: MainHelperService
  ) {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.messageData) {
      this.date = this.messageData.sendAt
      this.avatarSrc = this.messageData.avatar || this.avatarSrc;
      this.name = this.messageData.name || this.name;
      this.time = this.messageData.sendAtTime;
      this.messageText = this.messageData.messageText || this.messageText;
      this.reaction = this.messageData.reaction || this.reaction;
      this.isOwn = this.messageData.isOwn ?? this.isOwn;
      this.isThread = this.messageData.isThread ?? this.isThread;
      this.isInThread = this.messageData.isInThread ?? this.isInThread;
      this.isAnswered = this.messageData.isAnswered ?? this.isAnswered;
      this.threadCount = this.messageData.threadCount || this.threadCount;
      this.threadTo = this.messageData.threadTo ?? this.threadTo;
      this.channelID = this.messageData.channelId ?? this.channelID;
      this.threadAnswersId = this.messageData.messageId;
      this.channelIdThread = this.messageData.channelId;
      this.userId = this.messageData.id
      console.log('wthis.threadAnswersId,this.channelIdThreader', this.threadAnswersId, this.channelIdThread);

      this.channelmessageService.getReactionsForMessage(
        this.messageData.channelId,
        this.messageData.messageId,
        (reactionMap) => {
          this.emojiReactions = reactionMap;
          console.log(this.emojiReactions);

        }
      );
      const lastAnswer = this.channelmessageService.getLastAnswer(this.messageData);
      if (lastAnswer && lastAnswer.sendAtTime && lastAnswer.sendAt) {
        this.lastAnswerDate = lastAnswer.sendAtTime + ' ' + lastAnswer.sendAt;
      } else {
        this.lastAnswerDate = '';
      }
    } else {
      console.log('no Message Data')
    }



  }

  loadAllMessageInChannel() {
    this.channelmessageService.allMessages$.subscribe(Message => {
      this.allMessages = Message;
    });
  }




  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    const clickedInsideEmoji =
      (this.emojiComponent?.nativeElement && this.emojiComponent.nativeElement.contains(target)) ||
      (this.emojiImg?.nativeElement && this.emojiImg.nativeElement.contains(target)) ||
      (this.emojiImgWriter?.nativeElement && this.emojiImgWriter.nativeElement.contains(target));

    console.log('this.emojiComponent?', this.emojiComponent);


    const clickedInsideEmojiThread =
      this.emojiThreadMask?.nativeElement.contains(target) || this.emojiThread?.nativeElement.contains(target)


    if (!clickedInsideEmoji) {
      this.showEmojiPicker = false;
    }

    if (!clickedInsideEmojiThread) {
      this.showEmojiPickerThread = false;
    }

  }




  onReplyClick(): void {
    if (this.messageData) {
      this.channelmessageService.openThread(this.messageData);
      this.loadThreadAnswers();
    }
  }



isEditing(messageId: string): boolean {
  return this.editMessageId === messageId;
}

startEdit(messageId: string) {
  this.editMessageId = messageId;
}


  loadThreadAnswers(): void {
    this.allThreadsSubscription = this.channelmessageService.allMessages$.subscribe(
      (messages) => {
        if (this.messageData) {
          // Thread-Antworten filtern und setzen
          this.threadAnswers = this.channelmessageService.getThreadAnswers(this.messageData.messageId);

          // Emojis für jede Thread-Antwort laden
          this.loadEmojisForThreadAnswers();

          this.channelmessageService.updateThreadAnswers(this.messageData.messageId);

          const lastAnswer = this.messageService?.lastAnswer;
          if (lastAnswer?.sendAtTime && lastAnswer?.sendAt) {
            this.lastAnswerDate = `${lastAnswer.sendAtTime} ${lastAnswer.sendAt}`;
          }
        }
      }
    );
  }

  loadEmojisForThreadAnswers(): void {
    if (!this.threadAnswers || this.threadAnswers.length === 0) return;

    this.threadAnswers.forEach(msg => {
      this.channelmessageService.getReactionsForMessage(
        msg.channelId,
        msg.messageId,
        (reactionMap) => {
          // Hier die Reaktionen dem jeweiligen Thread-Message-Objekt hinzufügen
          (msg as any)['emojiReactions'] = reactionMap;
        }
      );
    });
  }



  showEmojiBar() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }


  showEmojiBarThread() {
    this.showEmojiPickerThread = !this.showEmojiPickerThread;
  }

 overwriteMessage(messageId:string) {
  this.toggleEditPopup();
  this.showEditPopup = false;
  this.editMessage = true;
  this.startEdit(messageId);
  this.mainHelperService.showEditMessage= true
  this.editedMessageText = this.messageText;
}

async saveEditedMessage() {
  if (!this.messageData || !this.editedMessageText.trim()) return;

  // Update in Firestore
  const channelId = this.channelID || this.messageData.channelId;
  const messageId = this.messageData.messageId;
  const newText = this.editedMessageText.trim();

  if (channelId && messageId) {
    const messageDocRef = this.messageService.firestore
      ? doc(this.messageService.firestore, 'channels', channelId, 'messages', messageId)
      : null;

    if (messageDocRef) {
      await updateDoc(messageDocRef, { messageText: newText });
      this.messageText = newText;
      this.editMessage = false;
      this.showEditPopup = false;
    }
  }
}

  closeEditPopup() {
    this.editMessage = false;
    this.showEditPopup = false;
  }


  toggleEditPopup(): void {
    this.showEditPopup = !this.showEditPopup;
  }


onCancelEdit() {
  this.mainHelperService.showEditMessage = false;
  this.editMessage = false;
  this.editMessageId = null;
}

  addEmoji(event: any, channelID: string, messageId?: string) {
    const emoji = event.emoji?.native || event;
    if (!messageId) return;
    this.channelmessageService.addEmojiInMessage(emoji, channelID, messageId);
  }

  handleEmojiClick(event: any,): void {
    const emoji = event.emoji?.native || event;

    const messageId = this.threadAnswersId ?? this.messageData?.messageId ?? this.selectedMessageId;
    const channelId = this.channelIdThread ?? this.messageData?.channelId ?? this.selectedChannelId;

    if (!messageId || !channelId) {
      console.warn('Missing messageId or channelId for emoji reaction', { messageId, channelId });
      return;
    }

    this.channelmessageService.addEmojiInMessage(emoji, channelId, messageId);
    this.showEmojiPickerThread = false;
  }

  ngOnDestroy(): void {
    if (this.allThreadsSubscription) {
      this.allThreadsSubscription.unsubscribe();
    }
  }


  async getUser(userId: string) {
    const userMemberId = userId
    await this.mainService.getUserDataFromFirebase(userMemberId)
    this.loadCurrentUser();
    this.openDialog();
  }
  async openProfil(userId: string) {

    if (!userId) return;
    await this.getUser(userId);
  }


  loadCurrentUser() {
    combineLatest([
      this.mainService.userStatus$,
      this.mainService.userEmail$,
      this.mainService.userName$,
      this.mainService.userId$,
      this.mainService.userAvatar$
    ])
      .pipe(take(1))  // ⬅️ Nur einmal abrufen
      .subscribe(([status, email, name, id, avatar]) => {
        this.userStatus = status;
        this.userEmail = email;
        this.userName = name;
        this.userId = id;
        this.userAvatar = avatar;



        this.resetProfileCard();
      });

  }


  resetProfileCard() {
    this.userDataReady$.next(false);
    setTimeout(() => {
      this.userDataReady$.next(true);
    }, 50);
  }

  handleProfileClosed() {
    this.userDataReady$.next(false);
  }


  openDialog() {
    if (!this.userName || !this.userEmail || !this.userStatus) {
      console.warn('Benutzerdaten unvollständig – Dialog nicht geöffnet');
      return;
    }
    const dialogRef = this.dialog.open(ProfilCardComponent, {
      data: {
        userStatus: this.userStatus,
        userEmail: this.userEmail,
        userName: this.userName,
        userId: this.userId,
        userAvatar: this.userAvatar,
      },
      panelClass: 'another-dialog-position'
    });
    dialogRef.componentInstance.showProfilCard.subscribe(() => {
      dialogRef.close();
    });
  }

}

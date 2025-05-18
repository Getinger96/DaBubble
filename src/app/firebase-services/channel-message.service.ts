import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Message } from '../interfaces/message.interface';
import {
  Firestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  DocumentData,
  onSnapshot,
  Query,
  deleteDoc,
  query,
  where
} from '@angular/fire/firestore';
import { MessageService } from './message.service';
import { User } from '../interfaces/user.interface';
import { MainComponentService } from './main-component.service';
@Injectable({
  providedIn: 'root'
})
export class ChannelMessageService {
  firestore: Firestore = inject(Firestore);
  allMessages: Message[] = [];
  channelMessageId?: string;
  messageId?: string;
  lastAnswer: Message | null = null;
  private allMessagesSubject = new BehaviorSubject<Message[]>([]);
  private selectedThreadMessageSubject = new BehaviorSubject<Message | null>(null);
  selectedThreadMessage$ = this.selectedThreadMessageSubject.asObservable();
  public showThreadSubject = new BehaviorSubject<boolean>(false);
  showThread$ = this.showThreadSubject.asObservable();
  private threadAnswersSubject = new BehaviorSubject<Message[]>([]);
  threadReplies$ = this.threadAnswersSubject.asObservable();

  allMessages$ = this.allMessagesSubject.asObservable();
  currentChannelname$: any;

  constructor(private messageService: MessageService, private mainservice: MainComponentService) {
  }





  subList(channelId: string) {
    console.log('📡 subList aufgerufen mit channelId:', channelId);
    const channelDocRef = doc(this.firestore, 'Channels', channelId);
    const messagesRef = collection(channelDocRef, 'messages');
    return onSnapshot(messagesRef, (snapshot) => {
      console.log('🟢 Snapshot empfangen', snapshot.size);
      let allMessages: Message[] = [];
      const actualUserID = this.messageService.getActualUser();
      snapshot.forEach(element => {
        const messageData = element.data();
        const isOwn = messageData['id'] === actualUserID;
        const message = this.messageService.setMessageObject(messageData, element.id);
        message.isOwn = isOwn;
        this.messageId = messageData['messageId']
        allMessages.push(message);
      });
      this.allMessages = allMessages;

      this.allMessagesSubject.next(this.allMessages);

      const selectedMessage = this.selectedThreadMessageSubject.value;
      if (selectedMessage) {
        this.updateThreadAnswers(selectedMessage.messageId);
      }
    });
  }

  getReactionsForMessage(
    channelId: string,
    messageId: string,
    callback: (reactionMap: Map<string, { count: number, users: string[] }>) => void
  ) {
    const reactionsRef = collection(this.firestore, 'Channels', channelId, 'messages', messageId, 'reactions');

    return onSnapshot(reactionsRef, snapshot => {
      const reactionMap = new Map<string, { count: number, users: string[] }>();

      snapshot.forEach(doc => {
        const data = doc.data();
        const emoji = data['emoji'];
        const user = data['reactedFrom'];

        if (!reactionMap.has(emoji)) {
          reactionMap.set(emoji, { count: 0, users: [] });
        }

        const current = reactionMap.get(emoji)!;
        current.count += 1;
        current.users.push(user);
      });

      callback(reactionMap);
    });
  }


  openThread(message: Message) {
    this.selectedThreadMessageSubject.next(message);
    console.log('Selected Thread Message is', this.selectedThreadMessageSubject)
    this.messageService.showThreadSubject.next(true);
    this.getThreadAnswers(message.messageId)
    this.updateThreadAnswers(message.messageId);
  }

  sortAllMessages(messageArray: Message[]): void {
    messageArray.sort((a, b) => {
      const timestampA = a.timestamp || 0;
      const timestampB = b.timestamp || 0;
      return timestampA - timestampB;
    });
  }

  getActualUser() {
    return this.mainservice?.actualUser[0]?.id;
  }
  getActualUserName() {
    return this.mainservice?.actualUser[0]?.name;
  }

  getThreadAnswers(id: string): Message[] {
    const threadAnswers = this.allMessages.filter((msg) => msg.threadTo === id);
    this.sortAllMessages(threadAnswers);
    const lastAnswer = threadAnswers[threadAnswers.length - 1];
    this.lastAnswer = lastAnswer;
    return threadAnswers;
  }

  updateThreadAnswers(threadTo: string) {
    const replies = this.allMessages.filter((msg) => msg.threadTo === threadTo);
    this.sortAllMessages(replies);
    this.threadAnswersSubject.next(replies);
  }




  getChannelId(channelId: string) {
    const channelDocRef = doc(this.firestore, 'Channels', channelId);
    const messagesRef = collection(channelDocRef, 'messages');
    console.log('channelDocRef', messagesRef);
    this.getMessagesAndMessageId(messagesRef)

  }



  getMessagesAndMessageId(messagesRef: Query<DocumentData>) {
    const unsubscribe = onSnapshot(
      messagesRef,
      (snapshot) => {
        snapshot.forEach(element => {
          const messageData = element.data();
          const messageId = element.id;
          this.channelMessageId = messageId;
          console.log('📩 Nachricht:', messageData);
          console.log('🆔 ID:', messageId);
        });
      },
      (error) => {
        console.error('Snapshot-Fehler:', error);
      }
    );

    return unsubscribe;
  }

  getMessageRef() {
    return collection(this.firestore, 'messages');
  }

  async addMessage(message: Message, channelid: string, channelname: string) {
    try {
      const channelDocRef = doc(this.firestore, 'Channels', channelid);
      const messagesRef = collection(channelDocRef, 'messages');
      const Userid = this.messageService.getActualUser()
      const docRef = await addDoc(messagesRef, this.messageService.messageJson2(message, Userid, channelid, channelname))
      const messageId = docRef.id;
      await updateDoc(docRef, { messageId });
      return messageId;
    } catch (error) {
      console.error('Error adding message:', error);
      return null
    }

  }

  async addThread(message: Message, channelid: string) {
    try {
      const channelDocRef = doc(this.firestore, 'Channels', channelid);
      const messagesRef = collection(channelDocRef, 'messages');
      const Userid = this.messageService.getActualUser()
      const docRef = await addDoc(messagesRef, this.messageService.threadJson(message, Userid, channelid))
      const messageId = docRef.id;
      await updateDoc(docRef, { messageId });
      return messageId;
    } catch (error) {
      console.error('Error adding message:', error);
      return null
    }

  }





  async addThreadAnswer(messageText: string, threadToId: string, selectedMessage: Message) {
    const userId = this.getActualUser();
    const user = this.mainservice.actualUser[0];

    let months = [
      'Januar',
      'Februar',
      'März',
      'April',
      'Mai',
      'Juni',
      'Juli',
      'August',
      'September',
      'Oktober',
      'November',
      'Dezember',
    ];
    let days = [
      'Montag',
      'Dienstag',
      'Mittwoch',
      'Donnerstag',
      'Freitag',
      'Samstag',
      'Sonntag',
    ];
    let d = new Date();
    let month = months[d.getMonth()];
    let dayString = days[d.getDay()];
    let dayNumber = d.getDate();
    let minutes = d.getMinutes();
    let hours = d.getHours();


    const threadAnswer: Message = {
      name: user.name,
      avatar: user.avatar,
      messageText: messageText,
      sendAt: `${dayString}, ${dayNumber}. ${month}`,
      sendAtTime: `${hours}:${minutes}`,
      timestamp: Date.now(),
      isOwn: true,
      isThread: true,
      isInThread: false,
      threadTo: threadToId,
      id: userId,
      messageId: '',
      channelId: selectedMessage.channelId,
      channelName: selectedMessage.channelName,
      reaction: 0,
      isAnswered: false,
      threadCount: 0,
    };

    const answerId = await this.addThread(threadAnswer, selectedMessage.channelId);
    if (answerId) {
      threadAnswer.messageId = answerId;
      console.log('Thread created with', answerId);
    }

    await this.updateMessageThreadCount(threadToId, selectedMessage.channelId);

    this.allMessagesSubject.next(this.allMessages);
  }
  async updateMessageThreadCount(messageId: string, channelid: string) {
    this.allMessagesSubject.next(this.allMessages);
    const replies = this.allMessages.filter(msg => msg.threadTo === messageId);
    const threadCount = replies.length;


    const channelRef = doc(this.firestore, 'Channels', channelid);
    const msgRef = doc(channelRef, 'messages', messageId)


    try {
      await updateDoc(msgRef, {
        threadCount: threadCount,
        isAnswered: threadCount > 0
      });

    } catch (error) {
      console.error("Error updating thread count:", error);
    }
  }


  getLastAnswer(message: Message) {
    const allAnswers = this.allMessages.filter((msg) => msg.threadTo === message.messageId);
    const lastAnswer = allAnswers[allAnswers.length - 1];
    console.log(lastAnswer)
    return lastAnswer;

  }



  async toggleReaction(reaction: string, channelID: string) {
    let emoji: string;
    const actualUser = this.getActualUserName();

    if (reaction === 'check') {
      emoji = '✅';
    } else if (reaction === 'like') {
      emoji = '👍';
    } else {
      console.warn('Unbekannte Reaktion:', reaction);
      return;
    }

    if (!this.messageId) {
      console.warn('messageId ist nicht definiert');
      return;
    }

    const reactionsRef = collection(
      this.firestore,
      'Channels', channelID, 'messages', this.messageId, 'reactions'
    );

    // 🔍 Prüfen, ob User diese Reaktion schon gesetzt hat
    const q = query(reactionsRef, where('reactedFrom', '==', actualUser), where('emoji', '==', emoji));
    const existing = await getDocs(q);

    if (!existing.empty) {
      // 🗑️ Reaktion entfernen (toggle off)
      existing.forEach(async docSnap => {
        await deleteDoc(docSnap.ref);
      });
    } else {
      // ➕ Reaktion setzen (toggle on)
      await addDoc(reactionsRef, {
        emoji,
        createdAt: new Date(),
        reactedFrom: actualUser
      });
    }
  }

}









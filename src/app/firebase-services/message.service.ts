import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from '@angular/fire/firestore';
import { Message } from '../interfaces/message.interface';
import { BehaviorSubject } from 'rxjs';
import { onSnapshot } from '@angular/fire/firestore';
import { RegisterService } from './register.service';
import { MainComponentService } from './main-component.service';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  firestore: Firestore = inject(Firestore);
  allMessages: Message[] = [];
  id?: string;

  private allMessagesSubject = new BehaviorSubject<Message[]>([]);
  allMessages$ = this.allMessagesSubject.asObservable();

  private selectedThreadMessageSubject = new BehaviorSubject<Message | null>(
    null
  );
  selectedThreadMessage$ = this.selectedThreadMessageSubject.asObservable();

  private showThreadSubject = new BehaviorSubject<boolean>(false);
  showThread$ = this.showThreadSubject.asObservable();

  private threadAnswersSubject = new BehaviorSubject<Message[]>([]);
  threadReplies$ = this.threadAnswersSubject.asObservable();

  unsubList;

  constructor(private registerService: RegisterService, private mainservice: MainComponentService) {
    this.unsubList = this.subList();
  }

  getMessageRef() {
    return collection(this.firestore, 'Messages');
  }

  setMessageObject(obj: any, id: string): Message {
    return {
      id: obj.id,
      name: obj.name,
      avatar: obj.avatar,
      messageText: obj.messageText,
      sendAt: obj.sendAt,
      sendAtTime: obj.sendAtTime,
      reaction: obj.reaction,
      isOwn: obj.isOwn,
      isAnswered: obj.isAnswered,
      isThread: obj.isThread,
      isInThread: obj.isInThread,
      threadTo: obj.threadTo,
      threadCount: obj.threadCount,
    };
  }

  subList() {
    return onSnapshot(this.getMessageRef(), (snapshot) => {
      let allMessages: Message[] = [];
      const actualUserID = this.getActualUser();
      snapshot.forEach(element => {
        const messageData = element.data();
        const isOwn = messageData['id'] === actualUserID;
        const message = this.setMessageObject(messageData, element.id);
        message.isOwn = isOwn;
        
        allMessages.push(message);
        console.log(allMessages)
      });
      
      allMessages.sort((a, b) => {
        if (a.timestamp && b.timestamp) {
          return a.timestamp - b.timestamp;
        }
        return 0;
      });
      
      this.allMessages = allMessages;
      this.allMessagesSubject.next(this.allMessages);
    });
  }

  getActualUser(){
    return this.mainservice?.actualUser[0]?.id;
  }

  async addMessageInFirebase(item: Message, id: string) {
    try {
      const docRef = await addDoc(this.getMessageRef(), this.messageJson(item, id));
      this.id = docRef.id;
      console.log("Message gespeichert mit ID:", docRef.id); // Automatisch generierte ID
      item.id = docRef.id;
      return docRef.id;
    } catch (error) {
      console.error("Fehler beim Hinzufügen des Messages:", error);
      return null; // Ensure all code paths return a value
    }
  }

  messageJson(item: Message, id: string) {
    return {
      name: item.name,
      avatar: item.avatar,
      messageText: item.messageText,
      id: id,
      sendAt: item.sendAt,
      sendAtTime: item.sendAtTime,
      timestamp: item.timestamp || Date.now(),
      isOwn: item.isOwn,
      parentId: item.threadTo || null,
      isThread: item.isThread || false,
      isInThread: item.isInThread || false,
      threadCount: item.threadCount || 0,
    };
  }

  openThread(message: Message) {
    this.selectedThreadMessageSubject.next(message);
    this.showThreadSubject.next(true);
    this.updateThreadAnswers(message.id);
  }


  closeThread() {
    this.showThreadSubject.next(false);
    this.selectedThreadMessageSubject.next(null);
  }


  updateThreadAnswers(threadTo: string) {
    const replies = this.allMessages.filter((msg) => msg.threadTo === threadTo);
    replies.sort((a, b) => {
      if (a.timestamp && b.timestamp) {
        return a.timestamp - b.timestamp;
      }
      return 0;
    });
    this.threadAnswersSubject.next(replies);
  }

  async addThreadAnswer(messageText: string, threadToId: string) {
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
      sendAt: `${dayString}, ${dayNumber} ${month}`,
      sendAtTime: `${hours}:${minutes}`,
      timestamp: Date.now(),
      isOwn: true,
      isThread: true,
      isInThread: false,
      threadTo: threadToId,
      id: '',
      reaction: 0,
      isAnswered: false,
      threadCount: 0,
    };

    const answerId = await this.addMessageInFirebase(threadAnswer, userId);

    await this.updateMessageThreadCount(threadToId);

    return answerId;
  }

  async updateMessageThreadCount(messageId: string) {

    const replies = this.allMessages.filter(msg => msg.threadTo === messageId);
    const threadCount = replies.length;
    

    const msgRef = doc(this.firestore, 'Messages', messageId);
    
    try {
      await updateDoc(msgRef, {
        threadCount: threadCount,
        isAnswered: threadCount > 0
      });
    } catch (error) {
      console.error("Error updating thread count:", error);
    }
  }}

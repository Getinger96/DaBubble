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
  messageId?:string;
  lastAnswer: Message | null = null;

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
      messageId: id,
      channelId: obj.channelId,
      id: obj.id,
      name: obj.name,
      avatar: obj.avatar,
      messageText: obj.messageText,
      sendAt: obj.sendAt,
      sendAtTime: obj.sendAtTime,
      timestamp: obj.timestamp || 0,
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

  getLastAnswer(message: Message){
    const allAnswers = this.allMessages.filter((msg) => msg.threadTo === message.messageId);
    const lastAnswer = allAnswers[allAnswers.length-1];
    console.log(lastAnswer)
    return lastAnswer;
    
  }

  sortAllMessages(messageArray : Message[]):void {
    messageArray.sort((a, b) => {
      const timestampA = a.timestamp || 0;
      const timestampB = b.timestamp || 0;
      return timestampA - timestampB;
    });
  }

  getActualUser(){
    return this.mainservice?.actualUser[0]?.id;
  }

  async addMessageInFirebase(item: Message) {
    try {
      const userID = this.getActualUser();
      const docRef = await addDoc(this.getMessageRef(), this.messageJson(item,userID));
      const messageId = docRef.id;
      console.log("Message gespeichert mit ID:", docRef.id); // Automatisch generierte ID

      await updateDoc(docRef, { messageId });
      return messageId;
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
      messageId: item.messageId || '',
      id: id,
      sendAt: item.sendAt,
      sendAtTime: item.sendAtTime,
      timestamp: item.timestamp || Date.now(),
      isOwn: item.isOwn,
      threadTo: item.threadTo || null,
      isThread: item.isThread || false,
      isInThread: item.isInThread || false,
      threadCount: item.threadCount || 0,
    };
  }

  openThread(message: Message) {
    this.selectedThreadMessageSubject.next(message);
    console.log('Selected Thread Message is',this.selectedThreadMessageSubject)
    this.showThreadSubject.next(true);
    this.getThreadAnswers(message.messageId)
    this.updateThreadAnswers(message.messageId);
  }

  closeThread() {
    this.showThreadSubject.next(false);
    this.selectedThreadMessageSubject.next(null);
  }

  getThreadAnswers(id: string): Message[] {
    const threadAnswers = this.allMessages.filter((msg) => msg.threadTo === id);
    this.sortAllMessages(threadAnswers);
    const lastAnswer = threadAnswers[threadAnswers.length-1];
    this.lastAnswer = lastAnswer;
    return threadAnswers;
  }


  updateThreadAnswers(threadTo: string) {
    const replies = this.allMessages.filter((msg) => msg.threadTo === threadTo);
    this.sortAllMessages(replies);
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
      sendAt: `${dayString}, ${dayNumber}. ${month}`,
      sendAtTime: `${hours}:${minutes}`,
      timestamp: Date.now(),
      isOwn: true,
      isThread: true,
      isInThread: false,
      threadTo: threadToId,
      id: userId,
      messageId: '',
      channelId: '',
      reaction: 0,
      isAnswered: false,
      threadCount: 0,
    };

    const answerId = await this.addMessageInFirebase(threadAnswer);
    if (answerId){
      threadAnswer.messageId = answerId;
      console.log('Thread created with', answerId);
    }

    await this.updateMessageThreadCount(threadToId);

    this.allMessagesSubject.next(this.allMessages);
  }

  async saveReaction(reaction: string) {
    let emoji: string;

    if (reaction === 'check') {
      emoji = '✅';
    } else if (reaction === 'like') {
      emoji = '👍';
    } else {
      console.warn('Unbekannte Reaktion:', reaction);
      return;
    }

    const reactionsRef = collection(
      this.firestore,
      `messages/${this.messageId}/reactions`
    );

    return await addDoc(reactionsRef, {
      emoji,
      createdAt: new Date()
    });
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

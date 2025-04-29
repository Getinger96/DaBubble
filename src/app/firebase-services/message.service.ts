import { Injectable,inject } from '@angular/core';
import { Firestore, collection, getDocs, addDoc } from '@angular/fire/firestore';
import { Message } from '../interfaces/message.interface';
import { BehaviorSubject } from 'rxjs';
import { onSnapshot } from '@angular/fire/firestore';
import { RegisterService } from './register.service';
import { MainComponentService } from './main-component.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  firestore: Firestore = inject(Firestore);
  allMessages: Message[] = [];
  id?: string;
  private allMessagesSubject = new BehaviorSubject<Message[]>([]);
  allMessages$ = this.allMessagesSubject.asObservable();
  unsubList;

  constructor(private registerService: RegisterService, private mainservice:MainComponentService) {
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
      isInThread: obj.isInThread
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
    };
  }
}

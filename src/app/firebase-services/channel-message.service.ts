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
  Query
} from '@angular/fire/firestore';
import { MessageService } from './message.service';
import { User } from '../interfaces/user.interface';
@Injectable({
  providedIn: 'root'
})
export class ChannelMessageService {
  firestore: Firestore = inject(Firestore);
  allMessages: Message[] = [];
  channelMessageId?: string;
  messageId?:string;
  lastAnswer: Message | null = null;
  private allMessagesSubject = new BehaviorSubject<Message[]>([]);
  private selectedThreadMessageSubject = new BehaviorSubject<Message | null>(null);
  selectedThreadMessage$ = this.selectedThreadMessageSubject.asObservable();

  allMessages$ = this.allMessagesSubject.asObservable();

  constructor(private messageService: MessageService) {
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
        this.messageService.updateThreadAnswers(selectedMessage.messageId);
      }
    });
  }


  sortAllMessages(messageArray : Message[]):void {
    messageArray.sort((a, b) => {
      const timestampA = a.timestamp || 0;
      const timestampB = b.timestamp || 0;
      return timestampA - timestampB;
    });
  }




  getChannelId(channelId:string){
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

    async addMessage(message: Message,channelid:string){
    try {
           const channelDocRef = doc(this.firestore, 'Channels', channelid);
     const messagesRef = collection(channelDocRef, 'messages');
     const Userid=this.messageService.getActualUser()
     const docRef = await addDoc(messagesRef,this.messageService.messageJson(message,Userid))
     const messageId = docRef.id;
     await updateDoc(docRef, { messageId }); 
    } catch (error) {
      
    }

    }



}






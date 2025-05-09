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
@Injectable({
  providedIn: 'root'
})
export class ChannelMessageService {
  firestore: Firestore = inject(Firestore);
  allMessages: Message[] = [];
  channelMessageId?: string;
  messageId?:string;
  lastAnswer: Message | null = null;
  constructor() { }





  getChannelId(channelId:string){
    const channelDocRef = doc(this.firestore, 'Channels', channelId);
     const messagesRef = collection(channelDocRef, 'messages');
     console.log('channelDocRef', messagesRef);
      this.getMessagesAndMessageId(messagesRef)

  }

<<<<<<< HEAD
  

=======


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
>>>>>>> 8a4a1d3019e16ee3d5565f5bdaa9eaad25ef0e4f
}






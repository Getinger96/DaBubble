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
  constructor(private messageService: MessageService) { }





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



    async addMessage(message: Message,channelid:string){
    
     const channelDocRef = doc(this.firestore, 'Channels', channelid);
     const messagesRef = collection(channelDocRef, 'messages');
     const Userid=this.messageService.getActualUser()
     return addDoc(messagesRef,this.messageService.messageJson(message,Userid))

    }
}






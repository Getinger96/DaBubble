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
} from '@angular/fire/firestore';
@Injectable({
  providedIn: 'root'
})
export class ChannelMessageService {
  firestore: Firestore = inject(Firestore);
  allMessages: Message[] = [];
  id?: string;
  messageId?:string;
  lastAnswer: Message | null = null;
  constructor() { }





  getChannelId(channelId:string){
    const channelDocRef = doc(this.firestore, 'Channels', channelId);
     const message = collection(channelDocRef, 'messages');
     console.log('channelDocRef', message);
     
  }

}

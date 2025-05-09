import { inject, Injectable } from '@angular/core';
import { collection, DocumentData, Firestore, getDocs, onSnapshot } from '@angular/fire/firestore';
import { Conversation } from '../interfaces/conversation.interface';
import { ConversationMessage } from '../interfaces/conversation-message.interface';
import { BehaviorSubject } from 'rxjs';
import { MainComponentService } from './main-component.service';

@Injectable({
  providedIn: 'root',
})
export class ConversationService {
  firestore: Firestore = inject(Firestore);

  allConversations: Conversation[] = [];

  private allConversationsSubject = new BehaviorSubject<Conversation[]>([]);
  allConversationsSubject$ = this.allConversationsSubject.asObservable();
  private allConversationMessagesSubject = new BehaviorSubject<ConversationMessage[]>([]);
  allConversationsMessagesSubject$ = this.allConversationMessagesSubject.asObservable();
  unsubList;

  
  constructor(private mainservice: MainComponentService) {
    this.unsubList = this.subList();
  }


  getConversationRef() {
    return collection(this.firestore, 'conversation');
  }


  getConversationMessageRef(conversationId: string){
    return collection(this.firestore,'conversation', conversationId, 'messages');
  }


  getActualUser() {
    return this.mainservice?.actualUser[0]?.id;
  }

  getClickedUser() {
    return this.mainservice.directmessaeUserIdSubject.value;
  }


    sortAllMessages(messageArray : ConversationMessage[]):void {
      messageArray.sort((a, b) => {
        const timestampA = a.timestamp || 0;
        const timestampB = b.timestamp || 0;
        return Number(timestampA) - Number(timestampB);
      });
    }


  setConversationObject(users: [], id: string, messages: { id: string; senderId: string; text: string; timestamp: Date; isOwn: boolean }[]): Conversation {
      return {
        id: id,
        users: users,
        conversationMessages: messages
      };
    }

  setConversationMessageObject(messageId: string, senderId: string, text: string, timestamp: Date, isOwn: boolean){
    return {
      id: messageId,
      senderId: senderId,
      text: text,
      timestamp: timestamp,
      isOwn: isOwn
      }
    }


    subList() {
      return onSnapshot(this.getConversationRef(), async (snapshot) => {
        const allConversations: Conversation[] = [];
    
        for (const element of snapshot.docs) {
          const conversationData = element.data();
          const conversationID = element.id;
          const conversationUsers = conversationData['user'];
          const allConversationMessages: { id: string; senderId: string; text: string; timestamp: Date; isOwn: boolean }[] = [];
    
          if (conversationID) {
            const messagesRef = collection(this.firestore, 'conversation', conversationID, 'messages');
            const querySnapshot = await getDocs(messagesRef);
    
            querySnapshot.forEach((doc) => {
              const messageData = doc.data();
              const conversationMessage = this.setConversationMessageObject(messageData['id'], messageData['senderId'], messageData['text'], messageData['timestamp'], messageData['isOwn'])
              allConversationMessages.push(conversationMessage);
            });
          }
          
          const conversation = this.setConversationObject(conversationUsers, conversationID, allConversationMessages);
          allConversations.push(conversation);
        }
        console.log(allConversations)
      });
    }
}

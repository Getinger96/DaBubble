import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from '@angular/fire/firestore';
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
  conversationId: string | undefined;
  public allConversationMessagesSubject = new BehaviorSubject<
    ConversationMessage[]
  >([]);
  allMessages$ = this.allConversationMessagesSubject.asObservable();

  constructor(private mainservice: MainComponentService) {
    if (this.conversationId) {
      this.getInitialConvMessages(this.conversationId);
      this.observeSelectedUserChanges();
    }
  }

  observeSelectedUserChanges() {
    let unsubscribeListener: (() => void) | null = null;

    this.mainservice.directmessaeUserIdSubject.subscribe(
      async (partnerUserId) => {
        const currentUserId = this.getActualUser();

        if (!partnerUserId || !currentUserId) return;

        const conversationId = await this.getOrCreateConversation(
          currentUserId,
          partnerUserId
        );
        this.conversationId = conversationId;

        const initialMessages = await this.getInitialConvMessages(
          conversationId
        );
        this.allConversationMessagesSubject.next(initialMessages);

        if (unsubscribeListener) {
          unsubscribeListener();
        }

        unsubscribeListener = this.listenToMessages(
          conversationId,
          (messages) => {
            this.allConversationMessagesSubject.next(messages);
          }
        );
      }
    );
  }

  async getOrCreateConversation(currentUserId: string, partnerUserId: string) {
    const convRef = collection(this.firestore, 'conversation');
    const snapshot = await getDocs(convRef);
    let conversationId: string | null = null;

    snapshot.forEach((docSnap) => {
      const users = docSnap.data()['user'];
      if (
        users.includes(currentUserId) &&
        users.includes(partnerUserId) &&
        users.length === 2
      ) {
        conversationId = docSnap.id;
      }
    });

    if (!conversationId) {
      const newConv = await addDoc(convRef, {
        user: [currentUserId, partnerUserId],
        id: conversationId,
      });
      conversationId = newConv.id;
    }

    const newConvDocRef = doc(convRef, conversationId);
    await updateDoc(newConvDocRef, {
      id: conversationId,
    });
    this.conversationId = conversationId;
    return conversationId;
  }

  async getInitialConvMessages(conversationId: string): Promise<any[]> {
    const convMessagesRef = collection(
      this.firestore,
      'conversation',
      conversationId,
      'messages'
    );
    const q = query(convMessagesRef, orderBy('timestamp'));
    const snapshot = await getDocs(q);
    const convMessages: any[] = [];
    snapshot.forEach((docSnap) => {
      convMessages.push({ id: docSnap.id, ...docSnap.data() });
    });
    return convMessages;
  }

  listenToMessages(
    conversationId: string,
    callback: (convMessages: any[]) => void
  ): () => void {
    const convMessageRef = collection(
      this.firestore,
      'conversation',
      conversationId,
      'messages'
    );
    const q = query(convMessageRef, orderBy('timestamp'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveConvMessages: ConversationMessage[] = [];
      snapshot.forEach((doc) => {
        liveConvMessages.push({
          id: doc.id,
          ...doc.data(),
        } as ConversationMessage);
      });
      callback(liveConvMessages);
      this.allConversationMessagesSubject.next(liveConvMessages);
    });

    return unsubscribe;
  }

  async sendMessage(conversationId: string, senderId: string, text: string) {
    const convMessageRef = collection(
      this.firestore,
      'conversation',
      conversationId,
      'messages'
    );
    await addDoc(convMessageRef, {
      id: conversationId,
      senderId,
      text,
      timestamp: new Date(),
      isOwn: true,
    });
  }

  getActualUser() {
    return this.mainservice?.actualUser[0]?.id;
  }

  getClickedUser() {
    return this.mainservice.directmessaeUserIdSubject.value;
  }

  sortAllMessages(messageArray: ConversationMessage[]): void {
    messageArray.sort((a, b) => {
      const timestampA = a.timestamp || 0;
      const timestampB = b.timestamp || 0;
      return Number(timestampA) - Number(timestampB);
    });
  }
}

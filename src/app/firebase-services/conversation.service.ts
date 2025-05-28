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
  allMessages: ConversationMessage[] = []; // Add this array to store all messages
  conversationId: string | undefined;
  public allConversationMessagesSubject = new BehaviorSubject<
    ConversationMessage[]
  >([]);
  allMessages$ = this.allConversationMessagesSubject.asObservable();

  private selectedThreadMessageSubject =
    new BehaviorSubject<ConversationMessage | null>(null);
  selectedThreadMessage$ = this.selectedThreadMessageSubject.asObservable();

  public showThreadSubject = new BehaviorSubject<boolean>(false);
  showThread$ = this.showThreadSubject.asObservable();

  private threadAnswersSubject = new BehaviorSubject<ConversationMessage[]>([]);
  threadReplies$ = this.threadAnswersSubject.asObservable();

  lastAnswer: ConversationMessage | null = null;
  messageId?: string;

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
        // Update allMessages array
        this.allMessages = initialMessages;
        this.allConversationMessagesSubject.next(initialMessages);

        if (unsubscribeListener) {
          unsubscribeListener();
        }

        unsubscribeListener = this.listenToMessages(
          conversationId,
          (messages) => {
            // Update allMessages array when new messages arrive
            this.allMessages = messages;
            this.allConversationMessagesSubject.next(messages);

            // Update thread answers if a thread is currently selected
            const selectedMessage = this.selectedThreadMessageSubject.value;
            if (selectedMessage && selectedMessage.id) {
              this.updateThreadAnswers(selectedMessage.id!);
            }
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
      const messageData = docSnap.data();
      const isOwn = messageData['senderId'] === this.getActualUser();
      const message: ConversationMessage = {
        id: docSnap.id,
        senderId: messageData['senderId'],
        text: messageData['text'],
        timestamp: messageData['timestamp'],
        isThread: messageData['isThread'],
        isInThread: messageData['isInThread'],
        threadTo: messageData['threadTo'],
        isOwn: isOwn,
      };
      convMessages.push(message);
    });
    return convMessages;
  }

  listenToMessages(
    conversationId: string,
    callback: (convMessages: ConversationMessage[]) => void
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
      const actualUserId = this.getActualUser();

      snapshot.forEach((doc) => {
        const messageData = doc.data();
        const isOwn = messageData['senderId'] === actualUserId;
        const message: ConversationMessage = {
          id: doc.id,
          senderId: messageData['senderId'],
          text: messageData['text'],
          timestamp: messageData['timestamp'],
          isThread: messageData['isThread'],
          isInThread: messageData['isInThread'],
          threadTo: messageData['threadTo'],
          isOwn: isOwn,
        };
        liveConvMessages.push(message);
      });

      callback(liveConvMessages);
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
      isThread: false,
      isInThread: false,
      threadTo: '',
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

  // Thread functionality methods - now using allMessages array
  openThread(message: ConversationMessage) {
    this.selectedThreadMessageSubject.next(message);
    console.log(
      'Selected Thread Message is',
      this.selectedThreadMessageSubject
    );
    this.showThreadSubject.next(true);
    const messageId = message.id;
    if (messageId) {
      this.getThreadAnswers(messageId);
      this.updateThreadAnswers(messageId);
    }
  }

  closeThread() {
    this.showThreadSubject.next(false);
    this.selectedThreadMessageSubject.next(null);
  }

  getThreadAnswers(id: string): ConversationMessage[] {
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

  getLastAnswer(message: ConversationMessage): ConversationMessage | undefined {
    const allAnswers = this.allMessages.filter(
      (msg) => msg.threadTo === (message.id || message.id)
    );
    const lastAnswer = allAnswers[allAnswers.length - 1];
    console.log(lastAnswer);
    return lastAnswer;
  }

  // Add thread answer functionality
  async addThreadAnswer(
    messageText: string,
    threadToId: string,
    selectedMessage: ConversationMessage
  ) {
    const userId = this.getActualUser();
    const user = this.mainservice.actualUser[0];

    const threadAnswer: ConversationMessage = {
      senderId: userId,
      text: messageText,
      timestamp: new Date(),
      isOwn: true,
      isThread: true,
      isInThread: false,
      threadTo: threadToId,
      id: '',
    };

    if (this.conversationId) {
      const convMessageRef = collection(
        this.firestore,
        'conversation',
        this.conversationId,
        'messages'
      );

      const docRef = await addDoc(convMessageRef, threadAnswer);
      threadAnswer.id = docRef.id;

      console.log('Thread answer created with ID:', docRef.id);

      // Update the document with the messageId
      await updateDoc(docRef, { messageId: docRef.id });
    }
  }
}

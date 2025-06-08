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
  where,
  QuerySnapshot,
  DocumentData,
  deleteDoc,
  getDoc,
  docData,
  collectionData
} from '@angular/fire/firestore';
import { Conversation } from '../interfaces/conversation.interface';
import { ConversationMessage } from '../interfaces/conversation-message.interface';
import { BehaviorSubject, from, timestamp } from 'rxjs';
import { MainComponentService } from './main-component.service';
import { User } from '../interfaces/user.interface';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ConversationService {
  firestore: Firestore = inject(Firestore);
  emojiCountsList: { [emoji: string]: number } = {};
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

  public threadAnswersSubject = new BehaviorSubject<ConversationMessage[]>([]);
  threadReplies$ = this.threadAnswersSubject.asObservable();



  lastAnswer: ConversationMessage | null = null;
  messageId?: string;
  



  constructor(private mainservice: MainComponentService, ) {
    
    this.observeSelectedUserChanges();
    if (this.conversationId) {
      this.getInitialConvMessages(this.conversationId);
      
    }

  }


  


  getConversationById(conversationId: string): Observable<Conversation | undefined> {
    if (!conversationId) return of(undefined);

    const conversationDocRef = doc(this.firestore, `conversations/${conversationId}`);

    return docData(conversationDocRef).pipe(
      map(c => c ? new Conversation(c as Conversation) : undefined)
    );
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
        name: messageData['name'],
        avatar: messageData['avatar'],
        threadCount: messageData['threadCount'],
        senderId: messageData['senderId'],
        text: messageData['text'],
        timestamp: messageData['timestamp'],
        isThread: messageData['isThread'],
        isInThread: messageData['isInThread'],
        threadTo: messageData['threadTo'],
        isOwn: isOwn,
        conversationmessageId: docSnap.id
      };
      if (message.isThread) {
        this.allMessages.push(message)
      } else {
        convMessages.push(message);
      }



    });
    console.log('Thread Messages for this selected Message:', this.allMessages)
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
      const liveThreadMessages: ConversationMessage[] = [];
      const actualUserId = this.getActualUser();

      snapshot.forEach((doc) => {
        const messageData = doc.data();
        const isOwn = messageData['senderId'] === actualUserId;
        const message: ConversationMessage = {
          id: messageData['id'],
          senderId: messageData['senderId'],
          text: messageData['text'],
          timestamp: messageData['timestamp'],
          isThread: messageData['isThread'],
          isInThread: messageData['isInThread'],
          threadTo: messageData['threadTo'],
          threadCount: messageData['threadCount'],
          name: messageData['name'],
          avatar: messageData['avatar'],
          isOwn: isOwn,
          conversationmessageId: messageData['conversationmessageId']
        };
        if (message.isThread) {
          liveThreadMessages.push(message);
        } else {
          liveConvMessages.push(message);
        }
      });

      // Update both arrays!
      this.allMessages = [...liveThreadMessages, ...liveConvMessages];
      this.allConversationMessagesSubject.next(liveConvMessages);

      // Update thread answers if a thread is currently selected
      const selectedMessage = this.selectedThreadMessageSubject.value;
      if (selectedMessage && selectedMessage.id) {
        this.updateThreadAnswers(selectedMessage.id!);
      }

      callback(liveConvMessages);
    });

    return unsubscribe;
  }

  async sendMessage(conversationId: string, senderId: string, text: string, name: string, avatar: number) {
    const convMessageRef = collection(
      this.firestore,
      'conversation',
      conversationId,
      'messages'
    );
    const docRef = await addDoc(convMessageRef, {
      id: conversationId,
      senderId,
      text,
      timestamp: new Date(),
      isOwn: true,
      isThread: false,
      isInThread: false,
      threadTo: '',
      threadCount: 0,
      name,
      avatar
    });
    const conversationmessageId = docRef.id;
    await updateDoc(docRef, { conversationmessageId });
    return conversationmessageId;
    ;
  }

  getActualUser() {
    return this.mainservice?.actualUser[0]?.id;
  }

  getActualUserName() {
    return this.mainservice?.actualUser[0]?.name;
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
    const messageId = message.conversationmessageId;
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
    console.log('Filtering for threadTo:', id);
  console.log('All messages:', this.allMessages);
  console.log('Filtered threadAnswers:', threadAnswers);
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
      name: user.name,
      avatar: user.avatar,
      threadCount: 0,
      text: messageText,
      timestamp: new Date(),
      isOwn: true,
      isThread: true,
      isInThread: false,
      threadTo: threadToId,
      id: '',
      conversationmessageId: '',
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

  addEmojiInMessage(emoji: any, conversationId: string, conversationmessageaId: string) {
    this.saveEmojiInFirebaseReaction(emoji, conversationId, conversationmessageaId)
  }


  async saveEmojiInFirebaseReaction(emoji: any, conversationId: string, conversationmessageaId: string) {
    const actualUser = this.getActualUserName();
    const reactionsRef = collection(this.firestore, 'conversation',
      conversationId,
      'messages', conversationmessageaId, 'reactions');
    const q = query(reactionsRef, where('reactedFrom', '==', actualUser), where('emoji', '==', emoji));
    const existingReactions = await getDocs(q);

    if (!existingReactions.empty) {
      this.deleteReaction(existingReactions, conversationId, conversationmessageaId)
      return;
    }
    const docRef = await addDoc(reactionsRef, this.reactionJson(emoji, actualUser));
    await updateDoc(docRef, { id: docRef.id });
    const emojiQuery = query(reactionsRef, where('emoji', '==', emoji));
    const emojiSnapshot = await getDocs(emojiQuery);
    const count = emojiSnapshot.size;
    this.saveEmojiInFirebaseMessage(emoji, conversationId, conversationmessageaId, count)


  }





  async deleteReaction(existingReactions: QuerySnapshot<DocumentData, DocumentData>, conversationId: string, conversationmessageaId: string) {
    const reactionDoc = existingReactions.docs[0];
    const reactionId = reactionDoc.id;
    const reactionDocRef = doc(this.firestore, 'conversation',
      conversationId,
      'messages', conversationmessageaId, 'reactions', reactionId);
    try {
      await deleteDoc(reactionDocRef);
    } catch (error) {
      console.error('Fehler beim Löschen der Reaktion:', error);
    }


  }

  reactionJson(emoji: any, actualUser: string) {
    return {
      emoji: emoji,
      reactedFrom: actualUser,
      createdAt: new Date(),
    }
  }


  async saveEmojiInFirebaseMessage(emoji: any, conversationId: string, conversationmessageaId: string, count: number) {
    const messageDocRef = doc(this.firestore, 'conversation',
      conversationId,
      'messages', conversationmessageaId,);
    const messageDocSnap = await getDoc(messageDocRef);

    this.emojiCountsList = {};

    if (messageDocSnap.exists()) {
      this.emojiCountsList = messageDocSnap.data()['emojiCounts'] || {};
    }

    this.emojiCountsList[emoji] = count;

    await updateDoc(messageDocRef, { emojiCounts: this.emojiCountsList });

  }


  getReactionsForMessage(conversationId: string, conversationmessageaId: string, callback: (reactionMap: Map<string, { count: number, users: string[] }>) => void
  ) {
    const reactionsRef = collection(this.firestore, 'conversation',
      conversationId,
      'messages', conversationmessageaId, 'reactions');

    return onSnapshot(reactionsRef, snapshot => {
      const reactionMap = new Map<string, { count: number, users: string[] }>();

      snapshot.forEach(doc => {
        const data = doc.data();
        const emoji = data['emoji'];
        const user = data['reactedFrom'];

        if (!reactionMap.has(emoji)) {
          reactionMap.set(emoji, { count: 0, users: [] });
        }

        const current = reactionMap.get(emoji)!;
        current.count += 1;
        current.users.push(user);
        console.log('current', current);
      });

      callback(reactionMap);
      console.log('reactionMap', reactionMap);


    });
  }

  async addThread(message: ConversationMessage) {
    try {
      if (!this.conversationId) {
        throw new Error('conversationId is undefined');
      }
      const conversationDocRef = doc(this.firestore, 'conversation', this.conversationId);
      const messagesRef = collection(conversationDocRef, 'messages');
      const Userid = this.getActualUser()
      const docRef = await addDoc(messagesRef, this.convThreadJson(message, Userid))
      const messageId = docRef.id;
      await updateDoc(docRef, { messageId });
      return messageId;
    } catch (error) {
      console.error('Error adding message:', error);
      return null
    }

  }


  async addConvThreadAnswer(messageText: string, threadToId: string, selectedMessage: ConversationMessage) {
    const userId = this.getActualUser();
    const user = this.mainservice.actualUser[0];
    const threadAnswer: ConversationMessage = this.convMessageJSON(user, messageText, threadToId, userId)
    const answerId = await this.addThread(threadAnswer);
    if (answerId) {
      threadAnswer.id = answerId;
      console.log('Thread created with', answerId);
    }

    await this.updateConvMessageThreadCount(threadToId, selectedMessage.id);

    this.allConversationMessagesSubject.next(this.allMessages);
  }

  convMessageJSON(user: User, messageText: string, threadToId: string, userId: string) {
    return {
      name: user.name,
      avatar: user.avatar,
      text: messageText,
      timestamp: new Date(),
      isOwn: true,
      isThread: true,
      isInThread: false,
      threadTo: threadToId,
      senderId: userId,
      id: '',
      threadCount: 0,
      conversationmessageId: '', // Added to satisfy ConversationMessage interface
    }

  }

  convThreadJson(item: ConversationMessage, id: string) {
    return {
      name: item.name,
      avatar: item.avatar,
      text: item.text,
      id: item.id || '',
      timestamp: item.timestamp || Date.now(),
      isOwn: item.isOwn,
      threadTo: item.threadTo || null,
      isThread: item.isThread || false,
      isInThread: item.isInThread || false,
      threadCount: item.threadCount || 0,
    };
  }

  async updateConvMessageThreadCount(messageId: string, conversationId: string) {
    this.allConversationMessagesSubject.next(this.allMessages);
    const replies = this.allMessages.filter(msg => msg.threadTo === messageId);
    const threadCount = replies.length;


    const conversationRef = doc(this.firestore, 'conversations', conversationId);
    const msgRef = doc(conversationRef, 'messages', messageId)


    try {
      await updateDoc(msgRef, {
        threadCount: threadCount,
        isAnswered: threadCount > 0
      });

    } catch (error) {
      console.error("Error updating thread count:", error);
    }
  }

  isTimestamp(value: any): value is { toMillis: () => number } {
    return value && typeof value.toMillis === 'function';
  }

  async loadAllDirectMessages(): Promise<void> {
  const conversationsRef = collection(this.firestore, 'conversation');
  const snapshot = await getDocs(conversationsRef);

  let allMessages: ConversationMessage[] = [];

  for (const convDoc of snapshot.docs) {
    const convId = convDoc.id;
    const messagesRef = collection(this.firestore, 'conversation', convId, 'messages');
    const messagesSnapshot = await getDocs(messagesRef);

    messagesSnapshot.forEach(docSnap => {
      const data = docSnap.data();
      const isOwn = data['senderId'] === this.getActualUser();

      const message: ConversationMessage = {
        id: data['id'],
        name: data['name'],
        avatar: data['avatar'],
        threadCount: data['threadCount'],
        senderId: data['senderId'],
        text: data['text'],
        timestamp: data['timestamp'],
        isThread: data['isThread'],
        isInThread: data['isInThread'],
        threadTo: data['threadTo'],
        isOwn: isOwn,
        conversationmessageId: docSnap.id,
        
      };

      if (!message.isThread) {
        allMessages.push(message);
      }
    });
  }

  // Sortieren
  allMessages.sort((a, b) => {
    const timeA = this.isTimestamp(a.timestamp)
      ? a.timestamp.toMillis()
      : new Date(a.timestamp).getTime();

    const timeB = this.isTimestamp(b.timestamp)
      ? b.timestamp.toMillis()
      : new Date(b.timestamp).getTime();

    return timeA - timeB;
  });

  this.allConversationMessagesSubject.next(allMessages);
}

 



}

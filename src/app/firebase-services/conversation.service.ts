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




  constructor(private mainservice: MainComponentService,) {

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

      this.closeThread();
      this.allMessages = [];
      this.lastAnswer = null;

      if (unsubscribeListener) {
        unsubscribeListener();
      }

      const conversationId = await this.getOrCreateConversation(
        currentUserId,
        partnerUserId
      );
      this.conversationId = conversationId;

      unsubscribeListener = this.listenToMessages(
        conversationId,
        (messages) => {
          console.log('Messages updated via listener:', messages);
        }
      );
    }
  );
}

   async getOrCreateConversation(currentUserId: string, partnerUserId: string) {
    const convRef = collection(this.firestore, 'conversation');
    const snapshot = await getDocs(query(convRef, where('user', 'array-contains', currentUserId)));

    let conversationId: string | null = null;

    snapshot.forEach((docSnap) => {
      const users = docSnap.data()['user'];
      const id = docSnap.id;

      if (currentUserId === partnerUserId) {
        // Prüfen auf doppelten Self-Chat-Eintrag
        if (
          users.length === 2 &&
          users[0] === currentUserId &&
          users[1] === partnerUserId
        ) {
          conversationId = id;
        }
      } else {
        // Normalfall: Zwei verschiedene User
        if (
          users.includes(currentUserId.trim()) &&
          users.includes(partnerUserId.trim()) &&
          users.length === 2
        ) {
          conversationId = id;
        }
      }
    });

    // Falls keine passende Konversation gefunden wurde, neue anlegen
    if (!conversationId) {
      console.log('No conversation found, creating a new one...');
      const newConv = await addDoc(convRef, {
        user: [currentUserId, partnerUserId] // funktioniert auch für [id, id]
      });
      console.log('Created new conversation with ID:', newConv.id);
      conversationId = newConv.id;
    }

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
        id: messageData['id'],
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
        conversationmessageId: docSnap.id,
        isAnswered: messageData['isAnswered']
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
        conversationmessageId: messageData['conversationmessageId'], // Make sure this is set correctly
        isAnswered: messageData['isAnswered']
      };

      if (message.isThread) {
        liveThreadMessages.push(message);
      } else {
        liveConvMessages.push(message);
      }
    });

    // CRITICAL: Update both arrays with ALL messages!
    this.allMessages = [...liveThreadMessages, ...liveConvMessages];
    
    // Log to verify
    console.log('All messages updated in listener:', this.allMessages);
    console.log('Thread messages:', liveThreadMessages);
    console.log('Conversation messages:', liveConvMessages);
    
    // Emit only conversation messages for the main chat display
    this.allConversationMessagesSubject.next(liveConvMessages);

    // Update thread answers if a thread is currently selected
    const selectedMessage = this.selectedThreadMessageSubject.value;
    if (selectedMessage && selectedMessage.conversationmessageId) {
      this.updateThreadAnswers(selectedMessage.conversationmessageId);
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
      isAnswered: false
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

  async addConvThreadAnswer(
    messageText: string,
    parentMessage: ConversationMessage
  ): Promise<void> {
    const userId = this.getActualUser();
    const user = this.mainservice.actualUser[0];

    if (!this.conversationId) {
      console.error('No conversation ID available');
      return;
    }

    // Create the thread answer object
    const threadAnswer: ConversationMessage = {
      senderId: userId,
      name: user.name,
      avatar: user.avatar,
      threadCount: 0,
      text: messageText,
      timestamp: new Date(),
      isThread: true,
      isInThread: false,
      threadTo: parentMessage.conversationmessageId,
      id: parentMessage.id,
      conversationmessageId: '',
      isOwn: true,
      isAnswered: false
    };

    try {
      const convMessageRef = collection(
        this.firestore,
        'conversation',
        this.conversationId,
        'messages'
      );

      // Add to Firestore
      const docRef = await addDoc(convMessageRef, threadAnswer);

      // Update the Firestore doc with its own ID
      await updateDoc(docRef, { conversationmessageId: docRef.id });

      // Update thread count on parent message
      await this.updateConvMessageThreadCount(
        parentMessage.conversationmessageId,
        this.conversationId
      );

      // DON'T manually update local arrays - let the listener handle it!
      // The listenToMessages method will automatically detect the new message
      // and update this.allMessages and this.allConversationMessagesSubject

      console.log('Thread answer created with ID:', docRef.id);
    } catch (error) {
      console.error('Error creating thread answer:', error);
      // You might want to show a user-friendly error message here
    }
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
      isAnswered: false
    }

  }



  async updateConvMessageThreadCount(messageId: string, conversationId: string) {
    // Filter replies based on the messageId (which should be conversationmessageId)
    const replies = this.allMessages.filter(msg => msg.threadTo === messageId);
    const threadCount = replies.length;

    // Use the current conversationId, not the passed conversationId parameter
    const currentConversationId = this.conversationId || conversationId;

    // Create the correct document reference
    const msgRef = doc(this.firestore, 'conversation', currentConversationId, 'messages', messageId);

    try {
      await updateDoc(msgRef, {
        threadCount: threadCount,
        isAnswered: threadCount > 0
      });

      console.log(`Updated thread count for message ${messageId}: ${threadCount}`);
    } catch (error) {
      console.error("Error updating thread count:", error, {
        messageId,
        conversationId: currentConversationId,
        threadCount
      });
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
          isAnswered: data['isAnswered']

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

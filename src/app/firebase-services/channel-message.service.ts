import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Message } from '../interfaces/message.interface';
import { Firestore, collection, QuerySnapshot, getDocs, addDoc, updateDoc, doc, DocumentData, onSnapshot, Query, deleteDoc, query, where, getDoc } from '@angular/fire/firestore';
import { MessageService } from './message.service';
import { User } from '../interfaces/user.interface';
import { MainComponentService } from './main-component.service';

@Injectable({
  providedIn: 'root'
})
export class ChannelMessageService {

  firestore: Firestore = inject(Firestore);
  allMessages: Message[] = [];
  channelMessageId?: string;
  messageId?: string;
  lastAnswer: Message | null = null;
  private allMessagesSubject = new BehaviorSubject<Message[]>([]);
  private selectedThreadMessageSubject = new BehaviorSubject<Message | null>(null);
  selectedThreadMessage$ = this.selectedThreadMessageSubject.asObservable();
  public showThreadSubject = new BehaviorSubject<boolean>(false);
  showThread$ = this.showThreadSubject.asObservable();
  private threadAnswersSubject = new BehaviorSubject<Message[]>([]);
  threadReplies$ = this.threadAnswersSubject.asObservable();
  emojiList: { emoji: string; number: number }[] = [];
  emojiCountsList: { [emoji: string]: number } = {};
  allMessages$ = this.allMessagesSubject.asObservable();
  currentChannelname$: any;
  private unsubscribeMessagesListener: (() => void) | null = null;


  constructor(private messageService: MessageService, private mainservice: MainComponentService) {
  }

  subList(channelId: string) {
    console.log('📡 subList aufgerufen mit channelId:', channelId);

    // Vorherige Snapshot-Subscription beenden
    if (this.unsubscribeMessagesListener) {
      this.unsubscribeMessagesListener();  // onSnapshot-Abbruch
      this.unsubscribeMessagesListener = null;
    }

    const channelDocRef = doc(this.firestore, 'Channels', channelId);
    const messagesRef = collection(channelDocRef, 'messages');

    // Neue Subscription starten
    this.unsubscribeMessagesListener = onSnapshot(messagesRef, snapshot => {
      this.handleSnapshot(snapshot);
    });
  }

  handleSnapshot(snapshot: QuerySnapshot<DocumentData, DocumentData>) {
    console.log('🟢 Snapshot empfangen', snapshot.size);

    const actualUserID = this.messageService.getActualUser();
    const allMessages: Message[] = [];

    // 🧹 Reset der lokalen Nachrichtenliste
    this.allMessages = [];

    snapshot.forEach(element => {
      const messageData = element.data();
      const isOwn = messageData['id'] === actualUserID;
      const message = this.messageService.setMessageObject(messageData, element.id);
      message.isOwn = isOwn;
      this.messageId = messageData['messageId'];
      allMessages.push(message);
    });

    this.subListMessages(allMessages);
  }

  subListMessages(allMessages: Message[]) {
    this.allMessages = allMessages;
    this.allMessagesSubject.next(this.allMessages);

    const selectedMessage = this.selectedThreadMessageSubject.value;
    if (selectedMessage) {
      this.updateThreadAnswers(selectedMessage.messageId);
    }
  }



  openThread(message: Message) {
    this.selectedThreadMessageSubject.next(message);
    console.log('Selected Thread Message is', this.selectedThreadMessageSubject.value)
    this.messageService.showThreadSubject.next(true);
    this.getThreadAnswers(message.messageId)
    this.updateThreadAnswers(message.messageId);
  }

  sortAllMessages(messageArray: Message[]): void {
    messageArray.sort((a, b) => {
      const timestampA = a.timestamp || 0;
      const timestampB = b.timestamp || 0;
      return timestampA - timestampB;
    });
  }

  getActualUser() {
    return this.mainservice?.actualUser[0]?.id;
  }
  getActualUserName() {
    return this.mainservice?.actualUser[0]?.name;
  }

  getThreadAnswers(id: string): Message[] {
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




  getChannelId(channelId: string) {
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

  async addMessage(message: Message, channelid: string, channelname: string) {
    try {
      const channelDocRef = doc(this.firestore, 'Channels', channelid);
      const messagesRef = collection(channelDocRef, 'messages');
      const Userid = this.messageService.getActualUser()
      const docRef = await addDoc(messagesRef, this.messageService.messageJson2(message, Userid, channelid, channelname))
      const messageId = docRef.id;
      await updateDoc(docRef, { messageId });
      return messageId;
    } catch (error) {
      console.error('Error adding message:', error);
      return null
    }

  }

  async addThread(message: Message, channelid: string) {
    try {
      const channelDocRef = doc(this.firestore, 'Channels', channelid);
      const messagesRef = collection(channelDocRef, 'messages');
      const Userid = this.messageService.getActualUser()
      const docRef = await addDoc(messagesRef, this.messageService.threadJson(message, Userid, channelid))
      const messageId = docRef.id;
      await updateDoc(docRef, { messageId });
      return messageId;
    } catch (error) {
      console.error('Error adding message:', error);
      return null
    }

  }


  async addThreadAnswer(messageText: string, threadToId: string, selectedMessage: Message) {
    const userId = this.getActualUser();
    const user = this.mainservice.actualUser[0];
    let now = new Date();
    const locale = 'de-DE';
    const weekday = now.toLocaleDateString(locale, { weekday: 'long' });  // z.B. "Montag"
    const day = now.getDate();                                            // z.B. 20
    const month = now.toLocaleDateString(locale, { month: 'long' });     // z.B. "Mai"
    const time = now.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });                                                                   // z.B. "14:05"

    const sendAt = `${weekday}, ${day}. ${month}`;                        // → "Montag, 20. Mai"
    const sendAtTime = time;
    const threadAnswer: Message = this.messageJSON(user, messageText, sendAt, sendAtTime, threadToId, userId, selectedMessage)
    const answerId = await this.addThread(threadAnswer, selectedMessage.channelId);
    if (answerId) {
      threadAnswer.messageId = answerId;
      console.log('Thread created with', answerId);
    }

    await this.updateMessageThreadCount(threadToId, selectedMessage.channelId);

    this.allMessagesSubject.next(this.allMessages);
  }

  messageJSON(user: User, messageText: string, sendAt: string, sendAtTime: string, threadToId: string, userId: string,
    selectedMessage: Message) {
    return {
      name: user.name,
      avatar: user.avatar,
      messageText: messageText,
      sendAt: sendAt,
      sendAtTime: sendAtTime,
      timestamp: Date.now(),
      isOwn: true,
      isThread: true,
      isInThread: false,
      threadTo: threadToId,
      id: userId,
      messageId: '',
      channelId: selectedMessage.channelId,
      channelName: selectedMessage.channelName,
      reaction: 0,
      isAnswered: false,
      threadCount: 0,
    }

  }


  async updateMessageThreadCount(messageId: string, channelid: string) {
    this.allMessagesSubject.next(this.allMessages);
    const replies = this.allMessages.filter(msg => msg.threadTo === messageId);
    const threadCount = replies.length;


    const channelRef = doc(this.firestore, 'Channels', channelid);
    const msgRef = doc(channelRef, 'messages', messageId)


    try {
      await updateDoc(msgRef, {
        threadCount: threadCount,
        isAnswered: threadCount > 0
      });

    } catch (error) {
      console.error("Error updating thread count:", error);
    }
  }


  getLastAnswer(message: Message) {
    const allAnswers = this.allMessages.filter((msg) => msg.threadTo === message.messageId);
    const lastAnswer = allAnswers[allAnswers.length - 1];
    console.log(lastAnswer)
    return lastAnswer;

  }


  addEmojiInMessage(emoji: any, channelID: string, messageID: string) {
    this.saveEmojiInFirebaseReaction(emoji, channelID, messageID)
  }


  getReactionsForMessage(channelId: string, messageId: string, callback: (reactionMap: Map<string, { count: number, users: string[] }>) => void
  ) {
    const reactionsRef = collection(this.firestore, 'Channels', channelId, 'messages', messageId, 'reactions');

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


  async saveEmojiInFirebaseReaction(emoji: any, channelID: string, messageID: string) {
    const actualUser = this.getActualUserName();
    const reactionsRef = collection(this.firestore, 'Channels', channelID, 'messages', messageID, 'reactions');
    const q = query(reactionsRef, where('reactedFrom', '==', actualUser), where('emoji', '==', emoji));
    const existingReactions = await getDocs(q);

    if (!existingReactions.empty) {
      this.deleteReaction(existingReactions, channelID, messageID)
      return;
    }
    const docRef = await addDoc(reactionsRef, this.reactionJson(emoji, actualUser));
    await updateDoc(docRef, { id: docRef.id });
    const emojiQuery = query(reactionsRef, where('emoji', '==', emoji));
    const emojiSnapshot = await getDocs(emojiQuery);
    const count = emojiSnapshot.size;
    this.saveEmojiInFirebaseMessage(emoji, channelID, messageID, count)


  }

  async deleteReaction(existingReactions: QuerySnapshot<DocumentData, DocumentData>, channelID: string, messageID: string) {
    const reactionDoc = existingReactions.docs[0];
    const reactionId = reactionDoc.id;
    const reactionDocRef = doc(this.firestore, 'Channels', channelID, 'messages', messageID, 'reactions', reactionId);
    try {
      await deleteDoc(reactionDocRef);
    } catch (error) {
      console.error('Fehler beim Löschen der Reaktion:', error);
    }
  }


  async saveEmojiInFirebaseMessage(emoji: any, channelID: string, messageID: string, count: number) {
    const messageDocRef = doc(this.firestore, 'Channels', channelID, 'messages', messageID);
    const messageDocSnap = await getDoc(messageDocRef);

    this.emojiCountsList = {};

    if (messageDocSnap.exists()) {
      this.emojiCountsList = messageDocSnap.data()['emojiCounts'] || {};
    }

    this.emojiCountsList[emoji] = count;

    await updateDoc(messageDocRef, { emojiCounts: this.emojiCountsList });

  }


  reactionJson(emoji: any, actualUser: string) {
    return {
      emoji: emoji,
      reactedFrom: actualUser,
      createdAt: new Date(),
    }

  }


  async loadAllMessagesFromAllChannels() {
    const channelsSnapshot = await getDocs(collection(this.firestore, 'Channels'));

    const allMessages: Message[] = [];

    for (const channelDoc of channelsSnapshot.docs) {
      const channelId = channelDoc.id;
      const messagesRef = collection(this.firestore, 'Channels', channelId, 'messages');
      const messagesSnapshot = await getDocs(messagesRef);

      messagesSnapshot.forEach(docSnap => {
        const messageData = docSnap.data();
        const message = this.messageService.setMessageObject(messageData, docSnap.id);
        message.isOwn = message.id === this.getActualUser();
        allMessages.push(message);
      });
    }

    this.sortAllMessages(allMessages);
    this.allMessages = allMessages;
    this.allMessagesSubject.next(this.allMessages);
  }

}










import { inject, Injectable, OnDestroy } from '@angular/core';
import { addDoc, collection, doc, Firestore, getDocs, onSnapshot, orderBy, query, updateDoc, where, QuerySnapshot, DocumentData, deleteDoc, getDoc, docData } from '@angular/fire/firestore';
import { Conversation } from '../interfaces/conversation.interface';
import { ConversationMessage } from '../interfaces/conversation-message.interface';
import { BehaviorSubject, from, timestamp } from 'rxjs';
import { MainComponentService } from './main-component.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { JsonDataService } from './json-data.service';

@Injectable({
  providedIn: 'root',
})

export class ConversationService implements OnDestroy {
  private messageUnsubscribers: (() => void)[] = [];

  emojiCountsList: { [emoji: string]: number } = {};
  private allConversationsSubject = new BehaviorSubject<Conversation[]>([]);
  public allConversations$ = this.allConversationsSubject.asObservable();
  conversationId: string | undefined;
  public allConversationMessagesSubject = new BehaviorSubject<ConversationMessage[]>([]);
  public allMessages$ = this.allConversationMessagesSubject.asObservable();
  public allMessages: ConversationMessage[] = [];
  private selectedThreadMessageSubject =
    new BehaviorSubject<ConversationMessage | null>(null);
  selectedThreadMessage$ = this.selectedThreadMessageSubject.asObservable();
  private messageMap = new Map<string, ConversationMessage[]>(); // convId → messages
  public showThreadSubject = new BehaviorSubject<boolean>(false);
  showThread$ = this.showThreadSubject.asObservable();
private selectedConversationMessagesSubject = new BehaviorSubject<ConversationMessage[]>([]);
public selectedConversationMessages$ = this.selectedConversationMessagesSubject.asObservable();
  public threadAnswersSubject = new BehaviorSubject<ConversationMessage[]>([]);
  threadReplies$ = this.threadAnswersSubject.asObservable();

  lastAnswer: ConversationMessage | null = null;
  messageId?: string;

  constructor(private mainservice: MainComponentService, private jsonService: JsonDataService, public firestore: Firestore,) {
    this.observeSelectedUserChanges();
    if (this.conversationId) {
      this.getInitialConvMessages(this.conversationId);
    }
  }

  /**
   * Retrieves a conversation by its unique identifier as an observable.
   *
   * @param conversationId - The unique ID of the conversation to retrieve.
   * @returns An Observable that emits the Conversation instance if found, or `undefined` if not found or if the ID is invalid.
   */
  getConversationById(conversationId: string): Observable<Conversation | undefined> {
    if (!conversationId) return of(undefined);
    const conversationDocRef = doc(this.firestore, `conversations/${conversationId}`
    );
    return docData(conversationDocRef).pipe(
      map((c) => (c ? new Conversation(c as Conversation) : undefined))
    );
  }

  /**
   * Observes changes to the selected user for direct messaging and manages the conversation state accordingly.
   *
   * - Subscribes to changes in the selected user ID from `mainservice.directmessaeUserIdSubject`.
   * - When the selected user changes:
   *   - Logs the new user ID.
   *   - Retrieves the current user ID.
   *   - If either user ID is missing, exits early.
   *   - Closes the current thread, resets messages and last answer.
   *   - Unsubscribes from any previous message listener.
   *   - Retrieves or creates a conversation between the current user and the selected user.
   *   - Sets up a real-time listener for messages in the conversation, updating the state when messages change.
   *
   * @remarks
   * This method ensures that only one message listener is active at a time and that the conversation state is kept in sync with the selected user.
   */
  observeSelectedUserChanges() {
    let unsubscribeListener: (() => void) | null = null;

    this.mainservice.directmessaeUserIdSubject.subscribe(
      async (partnerUserId) => {
        console.log('Selected user changed:', partnerUserId);
        const currentUserId = this.getActualUser();

        if (!partnerUserId || !currentUserId) return;

        this.closeThread();
        
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

  /**
   * Retrieves an existing conversation between the current user and a partner user,
   * or creates a new one if none exists. Handles both self-chat (user chatting with themselves)
   * and normal two-user conversations.
   *
   * @param currentUserId - The ID of the current user.
   * @param partnerUserId - The ID of the partner user to chat with.
   * @returns A promise that resolves to the conversation ID.
   */
  async getOrCreateConversation(currentUserId: string, partnerUserId: string) {
    const convRef = collection(this.firestore, 'conversation');

    // 1. Nutzer-IDs alphabetisch sortieren für Konsistenz
    const sortedUsers = [currentUserId, partnerUserId].sort();

    // 2. Alle vorhandenen Conversations holen
    const snapshot = await getDocs(convRef);

    // 3. Prüfen, ob Conversation mit genau diesen beiden Nutzern bereits existiert
    const existingConv = snapshot.docs.find((docSnap) => {
      const users = docSnap.data()['user'];
      return (
        Array.isArray(users) &&
        users.length === 2 &&
        [...users].sort().toString() === sortedUsers.toString()
      );
    });

    // 4. Falls vorhanden → ID zurückgeben
    if (existingConv) {
      this.conversationId = existingConv.id;
      return existingConv.id;
    }

    // 5. Falls nicht vorhanden → neue Conversation anlegen
    const newConv = await addDoc(convRef, {
      user: sortedUsers, // konsistente Speicherung
    });

    this.conversationId = newConv.id;
    return newConv.id;
  }
  /**
   * Retrieves the initial set of messages for a given conversation, ordered by timestamp.
   * 
   * @param conversationId - The unique identifier of the conversation to fetch messages from.
   * @returns A promise that resolves to an array of conversation messages, excluding thread messages.
   * 
   * @remarks
   * - Messages that are threads are pushed to `this.allMessages` and not included in the returned array.
   * - Each message object includes metadata such as sender information, timestamp, and thread status.
   * - The `isOwn` property is set based on whether the message was sent by the current user.
   */
  async getInitialConvMessages(conversationId: string): Promise<any[]> {
    const convMessagesRef = collection(this.firestore, 'conversation', conversationId, 'messages');
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
        isAnswered: messageData['isAnswered'],
      };
      if (message.isThread) {
        this.allMessages.push(message);
      } else {
        convMessages.push(message);
      }
    });
    return convMessages;
  }

  /**
   * Subscribes to real-time updates of messages within a specific conversation.
   * 
   * Sets up a Firestore listener on the messages collection for the given conversation ID,
   * orders messages by their timestamp, and processes incoming message snapshots.
   * Separates thread messages from regular conversation messages, updates internal state,
   * and invokes the provided callback with the latest conversation messages.
   * 
   * Also updates thread answers if a thread message is currently selected.
   * 
   * @param conversationId - The unique identifier of the conversation to listen to.
   * @param callback - A function to be called with the updated array of conversation messages whenever changes occur.
   * @returns A function to unsubscribe from the Firestore listener.
   */
  listenToMessages(conversationId: string, callback: (convMessages: ConversationMessage[]) => void): () => void {
    const convMessageRef = collection(this.firestore, 'conversation', conversationId, 'messages');
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
          isAnswered: messageData['isAnswered'],
        };

        if (message.isThread) {
          liveThreadMessages.push(message);
        } else {
          liveConvMessages.push(message);
        }
      });
      const combinedMessages = [...liveThreadMessages, ...liveConvMessages];
      this.selectedConversationMessagesSubject.next(combinedMessages);
      const selectedMessage = this.selectedThreadMessageSubject.value;
      if (selectedMessage && selectedMessage.conversationmessageId) {
        this.updateThreadAnswers(selectedMessage.conversationmessageId);
      }
      callback(liveConvMessages);
    });
    return unsubscribe;
  }

  /**
   * Sends a message to a specific conversation in Firestore.
   *
   * @param conversationId - The unique identifier of the conversation to which the message will be sent.
   * @param senderId - The unique identifier of the user sending the message.
   * @param text - The content of the message to be sent.
   * @param name - The display name of the sender.
   * @param avatar - The avatar identifier or index associated with the sender.
   * @returns A promise that resolves to the unique identifier of the newly created message document.
   *
   * @remarks
   * This method creates a new message document in the 'messages' subcollection of the specified conversation.
   * After the document is created, it updates the document with its own generated ID as `conversationmessageId`.
   */
  async sendMessage(conversationId: string, senderId: string, text: string, name: string, avatar: number) {
    const convMessageRef = collection(this.firestore, 'conversation', conversationId, 'messages');
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
      avatar,
    });
    const conversationmessageId = docRef.id;
    await updateDoc(docRef, { conversationmessageId });
    return conversationmessageId;
  }

  /**
   * Retrieves the ID of the currently active user.
   *
   * @returns The ID of the actual user if available; otherwise, `undefined`.
   */
  getActualUser() {
    return this.mainservice?.actualUser[0]?.id;
  }

  /**
   * Retrieves the name of the currently active user from the main service.
   *
   * @returns {string | undefined} The name of the actual user if available; otherwise, `undefined`.
   */
  getActualUserName() {
    return this.mainservice?.actualUser[0]?.name;
  }

  /**
   * Retrieves the currently selected user's ID from the main service.
   *
   * @returns The user ID of the clicked user as stored in the `directmessaeUserIdSubject`'s current value.
   */
  getClickedUser() {
    return this.mainservice.directmessaeUserIdSubject.value;
  }

  /**
   * Sorts an array of `ConversationMessage` objects in-place by their `timestamp` property in ascending order.
   * If a message does not have a `timestamp`, it is treated as `0`.
   *
   * @param messageArray - The array of `ConversationMessage` objects to be sorted.
   */
  sortAllMessages(messageArray: ConversationMessage[]): void {
    messageArray.sort((a, b) => {
      const timestampA = a.timestamp || 0;
      const timestampB = b.timestamp || 0;
      return Number(timestampA) - Number(timestampB);
    });
  }

  /**
   * Opens a thread for the given conversation message.
   * 
   * This method performs the following actions:
   * - Sets the selected thread message.
   * - Logs the selected thread message subject to the console.
   * - Shows the thread UI by updating the relevant subject.
   * - If the message has a valid `conversationmessageId`, it:
   *   - Retrieves the thread answers for the message.
   *   - Subscribes to updates for the thread answers.
   *   - Updates the thread count for the conversation message.
   *
   * @param message - The conversation message for which to open the thread.
   */
  openThread(message: ConversationMessage) {
    this.selectedThreadMessageSubject.next(message);
    console.log('Selected Thread Message is', this.selectedThreadMessageSubject);
    this.showThreadSubject.next(true);
    const messageId = message.conversationmessageId;
    if (messageId) {
      this.getThreadAnswers(messageId);
      this.updateThreadAnswers(messageId);
      this.updateConvMessageThreadCount(
        messageId,
        this.selectedThreadMessageSubject.value?.id || ''
      );
    }
  }

  /**
   * Closes the currently open thread in the conversation view.
   * 
   * This method hides the thread UI by emitting `false` to `showThreadSubject`
   * and clears the currently selected thread message by emitting `null` to
   * `selectedThreadMessageSubject`.
   */
  closeThread() {
    this.showThreadSubject.next(false);

  }

  /**
   * Retrieves all messages that are answers to a specific thread, sorts them,
   * updates the `lastAnswer` property with the most recent answer, and returns the list.
   *
   * @param id - The unique identifier of the thread to retrieve answers for.
   * @returns An array of `ConversationMessage` objects that are answers to the specified thread.
   */
  getThreadAnswers(id: string): ConversationMessage[] {
    const threadAnswers = this.allMessages.filter((msg) => msg.threadTo === id);
    this.sortAllMessages(threadAnswers);
    const lastAnswer = threadAnswers[threadAnswers.length - 1];
    this.lastAnswer = lastAnswer;
    return threadAnswers;
  }

  /**
   * Updates the list of thread answers for a given thread identifier.
   *
   * Filters all messages to find those that belong to the specified thread,
   * sorts the filtered replies, and emits the updated list to the threadAnswersSubject.
   *
   * @param threadTo - The identifier of the thread to retrieve answers for.
   */
  updateThreadAnswers(threadTo: string) {
    const replies = this.allMessages.filter((msg) => msg.threadTo === threadTo);
    this.sortAllMessages(replies);
    this.threadAnswersSubject.next(replies);
  }

  /**
   * Retrieves the last answer message in the conversation thread related to the given message.
   *
   * Filters all messages to find those that are replies to the specified message,
   * then returns the most recent one (i.e., the last in the filtered list).
   *
   * @param message - The conversation message for which to find the last answer.
   * @returns The last answer message in the thread, or `undefined` if there are no answers.
   */
  getLastAnswer(message: ConversationMessage): ConversationMessage | undefined {
    const allAnswers = this.allMessages.filter(
      (msg) =>
        msg.threadTo ===
        (message.conversationmessageId || message.conversationmessageId)
    );
    const lastAnswer = allAnswers[allAnswers.length - 1];
    return lastAnswer;
  }

  /**
   * Adds a new answer to a thread within a conversation.
   *
   * This method creates a new `ConversationMessage` as a thread answer, associates it with the specified thread,
   * and stores it in the Firestore database under the current conversation. After adding the message,
   * it updates the thread answers and sets the message ID in the document.
   *
   * @param messageText - The text content of the thread answer message.
   * @param threadToId - The ID of the message to which this answer is threaded.
   * @returns A promise that resolves when the thread answer has been added and updated in Firestore.
   */
  async addThreadAnswer(
    messageText: string,
    threadToId: string,
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
      isAnswered: false,
    };

    if (this.conversationId) {
      const convMessageRef = collection(this.firestore, 'conversation', this.conversationId, 'messages');
      const docRef = await addDoc(convMessageRef, threadAnswer);
      threadAnswer.id = docRef.id;
      this.updateThreadAnswers(threadToId);
      await updateDoc(docRef, { messageId: docRef.id });
    }
  }

  /**
   * Adds an emoji reaction to a specific message within a conversation.
   *
   * @param emoji - The emoji object or identifier to be added as a reaction.
   * @param conversationId - The unique identifier of the conversation containing the message.
   * @param conversationmessageaId - The unique identifier of the message to which the emoji reaction will be added.
   */
  addEmojiInMessage(emoji: any, conversationId: string, conversationmessageaId: string) {
    this.saveEmojiInFirebaseReaction(
      emoji,
      conversationId,
      conversationmessageaId
    );
  }

  /**
   * Adds or removes an emoji reaction for a specific message in a conversation in Firebase.
   * 
   * If the current user has already reacted to the message with the same emoji, the reaction is removed.
   * Otherwise, a new reaction is added. After updating the reactions, the method updates the emoji count
   * for the message.
   * 
   * @param emoji - The emoji to react with.
   * @param conversationId - The ID of the conversation containing the message.
   * @param conversationmessageaId - The ID of the message to react to.
   * @returns A promise that resolves when the operation is complete.
   */
  async saveEmojiInFirebaseReaction(
    emoji: any,
    conversationId: string,
    conversationmessageaId: string
  ) {
    const actualUser = this.getActualUserName();
    const reactionsRef = collection(this.firestore, 'conversation', conversationId, 'messages', conversationmessageaId, 'reactions');
    const q = query(
      reactionsRef,
      where('reactedFrom', '==', actualUser),
      where('emoji', '==', emoji)
    );
    const existingReactions = await getDocs(q);

    if (!existingReactions.empty) {
      this.deleteReaction(
        existingReactions,
        conversationId,
        conversationmessageaId
      );
      return;
    }
    const docRef = await addDoc(
      reactionsRef,
      this.jsonService.reactionJson(emoji, actualUser)
    );
    await updateDoc(docRef, { id: docRef.id });
    const emojiQuery = query(reactionsRef, where('emoji', '==', emoji));
    const emojiSnapshot = await getDocs(emojiQuery);
    const count = emojiSnapshot.size;
    this.saveEmojiInFirebaseMessage(
      emoji,
      conversationId,
      conversationmessageaId,
      count
    );
  }

  /**
   * Deletes the first reaction document from a message in a conversation.
   *
   * @param existingReactions - A QuerySnapshot containing the existing reaction documents for the message.
   * @param conversationId - The ID of the conversation containing the message.
   * @param conversationmessageaId - The ID of the message from which the reaction should be deleted.
   * 
   * @remarks
   * This method deletes only the first reaction found in the provided QuerySnapshot.
   * If no reactions exist, this method will throw an error.
   * 
   * @throws Will log an error to the console if the deletion fails.
   */
  async deleteReaction(
    existingReactions: QuerySnapshot<DocumentData, DocumentData>,
    conversationId: string,
    conversationmessageaId: string
  ) {
    const reactionDoc = existingReactions.docs[0];
    const reactionId = reactionDoc.id;
    const reactionDocRef = doc(this.firestore, 'conversation', conversationId, 'messages', conversationmessageaId, 'reactions', reactionId);
    try {
      await deleteDoc(reactionDocRef);
    } catch (error) {
      console.error('Fehler beim Löschen der Reaktion:', error);
    }
  }

  /**
   * Saves or updates the count of a specific emoji reaction for a message in a Firebase conversation.
   *
   * Retrieves the message document from Firestore, updates the emoji count for the specified emoji,
   * and writes the updated emoji counts back to the document.
   *
   * @param emoji - The emoji to be saved or updated (can be any type, typically a string or emoji object).
   * @param conversationId - The ID of the conversation containing the message.
   * @param conversationmessageaId - The ID of the message within the conversation.
   * @param count - The new count for the specified emoji.
   * @returns A promise that resolves when the emoji count has been updated in Firestore.
   */
  async saveEmojiInFirebaseMessage(
    emoji: any,
    conversationId: string,
    conversationmessageaId: string,
    count: number
  ) {
    const messageDocRef = doc(this.firestore, 'conversation', conversationId, 'messages', conversationmessageaId);
    const messageDocSnap = await getDoc(messageDocRef);

    this.emojiCountsList = {};

    if (messageDocSnap.exists()) {
      this.emojiCountsList = messageDocSnap.data()['emojiCounts'] || {};
    }

    this.emojiCountsList[emoji] = count;

    await updateDoc(messageDocRef, { emojiCounts: this.emojiCountsList });
  }

  /**
   * Subscribes to real-time updates of reactions for a specific message within a conversation.
   *
   * @param conversationId - The ID of the conversation containing the message.
   * @param conversationmessageaId - The ID of the message for which to retrieve reactions.
   * @param callback - A function invoked with a map of reactions, where each key is an emoji and the value contains the count and list of user IDs who reacted.
   * @returns An unsubscribe function to stop listening for updates.
   *
   * @remarks
   * This method listens for changes in the 'reactions' subcollection of a message document in Firestore.
   * The callback receives a `Map` where each key is an emoji string, and the value is an object with:
   *   - `count`: The number of times the emoji was used as a reaction.
   *   - `users`: An array of user IDs who reacted with that emoji.
   */
  getReactionsForMessage(
    conversationId: string,
    conversationmessageaId: string,
    callback: (
      reactionMap: Map<string, { count: number; users: string[] }>
    ) => void
  ) {
    const reactionsRef = collection(this.firestore, 'conversation', conversationId, 'messages', conversationmessageaId, 'reactions');

    return onSnapshot(reactionsRef, (snapshot) => {
      const reactionMap = new Map<string, { count: number; users: string[] }>();

      snapshot.forEach((doc) => {
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

  /**
   * Adds a new thread answer message to an existing conversation thread in Firestore.
   *
   * This method creates a new `ConversationMessage` as a thread answer to the specified parent message,
   * associates it with the current user, and stores it in the Firestore database under the current conversation.
   * After adding the message, it updates the document to include its generated Firestore ID.
   *
   * @param messageText - The text content of the thread answer message.
   * @param parentMessage - The parent `ConversationMessage` to which this answer is being added as a thread.
   * @returns A promise that resolves when the thread answer has been successfully added and updated in Firestore.
   */
  async addConvThreadAnswer(messageText: string, parentMessage: ConversationMessage): Promise<void> {
    const userId = this.getActualUser();
    const user = this.mainservice.actualUser[0];

    if (!this.conversationId) {
      console.error('No conversation ID available');
      return;
    }

    const threadAnswer: ConversationMessage = {
      senderId: userId,
      name: user.name,
      avatar: user.avatar,
      threadCount: 0,
      text: messageText,
      timestamp: new Date(),
      isThread: true,
      isInThread: true,
      threadTo: parentMessage.conversationmessageId,
      id: parentMessage.id,
      conversationmessageId: '',
      isOwn: true,
      isAnswered: false,
    };

    try {
      const convMessageRef = collection(this.firestore, 'conversation', this.conversationId, 'messages');
      const docRef = await addDoc(convMessageRef, threadAnswer);
      await updateDoc(docRef, { conversationmessageId: docRef.id });
    } catch (error) {
      console.error('Error creating thread answer:', error);
    }
  }

  /**
   * Updates the thread count and answered status for a specific message within a conversation.
   *
   * This method filters all messages to find replies to the given message, calculates the thread count,
   * and updates the corresponding message document in Firestore with the new thread count and
   * whether the message has been answered (i.e., has at least one reply).
   *
   * @param messageId - The ID of the message whose thread count should be updated.
   * @param conversationId - The ID of the conversation containing the message.
   * @returns A promise that resolves when the Firestore document has been updated.
   *
   * @throws Will log an error to the console if the Firestore update fails.
   */
  async updateConvMessageThreadCount(messageId: string, conversationId: string) {
    const replies = this.allMessages.filter(
      (msg) => msg.threadTo === messageId
    );
    const threadCount = replies.length;
    const currentConversationId = this.conversationId || conversationId;
    const msgRef = doc(this.firestore, 'conversation', currentConversationId, 'messages', messageId);

    try {
      await updateDoc(msgRef, {
        threadCount: threadCount,
        isAnswered: threadCount > 0,
      });

      console.log(
        `Updated thread count for message ${messageId}: ${threadCount}`
      );
    } catch (error) {
      console.error('Error updating thread count:', error, {
        messageId,
        conversationId: currentConversationId,
        threadCount,
      });
    }
  }

  /**
   * Type guard to check if a given value is a Firestore Timestamp-like object.
   *
   * Determines if the provided value has a `toMillis` method, which is commonly
   * used to identify Firestore Timestamp objects.
   *
   * @param value - The value to check.
   * @returns True if the value has a `toMillis` function, otherwise false.
   */
  isTimestamp(value: any): value is { toMillis: () => number } {
    return value && typeof value.toMillis === 'function';
  }

  /**
   * Loads all direct messages from the Firestore 'conversation' collection and their respective 'messages' subcollections.
   * 
   * For each conversation, retrieves all messages, constructs `ConversationMessage` objects, and filters out messages that are threads.
   * The resulting list of messages is sorted by timestamp in ascending order and emitted via the `allConversationMessagesSubject`.
   * 
   * @returns {Promise<void>} A promise that resolves when all messages have been loaded and emitted.
   */
  loadAllDirectMessagesLive(): void {
    const conversationsRef = collection(this.firestore, 'conversation');

    const convUnsub = onSnapshot(conversationsRef, (conversationSnapshot) => {
      this.clearMessageListeners(); // ja – Listener entfernen
      this.messageMap.clear();      // ✅ NUR den Map-CACHE leeren, nicht sofort allMessages

      const conversations: Conversation[] = conversationSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          users: data['user'],
        } as Conversation;
      });

      this.allConversationsSubject.next(conversations);

      // Für jede Conversation Nachrichten laden
      conversationSnapshot.forEach((conversationDoc) => {
        const convId = conversationDoc.id;
        const messagesRef = collection(this.firestore, 'conversation', convId, 'messages');

        const msgUnsub = onSnapshot(messagesRef, (messagesSnapshot) => {
          const newMessages: ConversationMessage[] = [];

          messagesSnapshot.forEach((docSnap) => {
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
              conversationId: convId,
              conversationmessageId: docSnap.id,
              isAnswered: data['isAnswered'],
            };

            newMessages.push(message);
          });

          // Sortieren
          newMessages.sort((a, b) => {
            const timeA = this.isTimestamp(a.timestamp)
              ? a.timestamp.toMillis()
              : new Date(a.timestamp).getTime();
            const timeB = this.isTimestamp(b.timestamp)
              ? b.timestamp.toMillis()
              : new Date(b.timestamp).getTime();
            return timeA - timeB;
          });

          // 🔁 Map aktualisieren
          this.messageMap.set(convId, newMessages);

          // 🔁 allMessages neu zusammensetzen
          this.allMessages = Array.from(this.messageMap.values()).flat();

          // ✅ Subject updaten
          this.allConversationMessagesSubject.next([...this.allMessages]);
        }, (err) => {
          console.error(`❌ Fehler beim Messages-Snapshot für ${convId}:`, err);
        });

        this.messageUnsubscribers.push(msgUnsub);
      });
    }, (error) => {
      console.error('❌ Fehler beim Conversation-Snapshot:', error);
    });

    this.messageUnsubscribers.push(convUnsub);
  }

  private clearMessageListeners(): void {
    this.messageUnsubscribers.forEach(unsub => unsub());
    this.messageUnsubscribers = [];
  }
  ngOnDestroy(): void {
    this.clearMessageListeners();
  }


}

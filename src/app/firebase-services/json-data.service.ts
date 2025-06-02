import { Injectable } from '@angular/core';
import { User } from '../interfaces/user.interface';
import { Message } from '../interfaces/message.interface';
@Injectable({
  providedIn: 'root'
})
export class JsonDataService {

  constructor() { }



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
}

import { Injectable } from '@angular/core';
import { User } from '../interfaces/user.interface';
import { Message } from '../interfaces/message.interface';
import { Channel } from '../interfaces/channel.interface';
import { Member } from '../interfaces/member.interface';
@Injectable({
  providedIn: 'root'
})
export class JsonDataService {

  constructor() { }



  messageJSON(user: User, messageText: string, sendAt: string, sendAtTime: string, threadToId: string, userId: string, selectedMessage: Message) {
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

  userJsonGoogleMail(item: User, id: string) {
    return {
      name: item.name,
      email: item.email,
      passwort: item.passwort,
      id: '',
      uid: item.uid,
      avatar: 1,
      status: 'Online'
    };
  }

  newUserWithGoogleMail(user: any) {
    return {
      uid: user.uid,
      id: '',
      name: user.displayName || 'Unbekannt',
      email: user.email || '',
      passwort: '',
      avatar: 1,
      status: 'Online'
    };
  }

  reactionJson(emoji: any, actualUser: string) {
    return {
      emoji: emoji,
      reactedFrom: actualUser,
      createdAt: new Date(),
    }
  }

  channelJson(item: Channel, creator: string, date: string) {
    return {
      id: item.id,
      name: item.name,
      members: [] as Member[],
      creator: creator,
      description: item.description,
      date: date

    }
  }
}

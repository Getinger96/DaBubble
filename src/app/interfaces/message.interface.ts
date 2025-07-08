import { SafeScript } from "@angular/platform-browser";
import { Timestamp } from 'firebase/firestore';

export class Message {
    id: string;
    messageId: string;
    channelId: string;
    channelName: string;
    name: string;
    avatar: number;
    messageText: string;
    sendAt: string;
    sendAtTime: string;
      timestamp?: number | string | Date | Timestamp | { seconds: number; nanoseconds: number };
    reaction: number;
    isOwn: boolean;
    isAnswered: boolean;
    isThread: boolean;
    isInThread: boolean;
    threadTo: string;
    threadCount: number;



    constructor(obj?: any) {
        this.id = obj ? obj.id : ''
        this.messageId = obj ? obj.messageId : ''
        this.channelId = obj ? obj.channelId : ''
        this.channelName = obj ? obj.chanelName : ''
        this.name = obj ? obj.name : ''
        this.avatar = obj ? obj.avatar : ''
        this.messageText = obj ? obj.messageText : ''
        this.sendAt = obj ? obj.sendAt : ''
        this.sendAtTime = obj ? obj.sendAtTime : ''
       this.timestamp = obj?.timestamp ?? Date.now();
        this.reaction = obj ? obj.reaction : ''
        this.isOwn = obj ? obj.isOwn : false
        this.isAnswered = obj ? obj.isAnswered : false
        this.isThread = obj ? obj.isThread : false
        this.isInThread = obj ? obj.isInThread : false
        this.threadTo = obj ? obj.threadTo : ''
        this.threadCount = obj ? obj.threadCount : ''

    }

}

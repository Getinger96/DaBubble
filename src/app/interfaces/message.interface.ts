import { SafeScript } from "@angular/platform-browser";

export class Message {
    id: string;
    name: string;
    avatar: number;
    messageText: string;
    sendAt: string;
    sendAtTime: string;
    timestamp?: number;
    reaction: number;
    isOwn: boolean;
    isAnswered: boolean;
    isThread: boolean;
    isInThread: boolean;


    constructor(obj?:any) {
        this.id = obj?obj.id:''
        this.name = obj?obj.name:''
        this.avatar = obj?obj.avatar:''
        this.messageText = obj?obj.messageText:''
        this.sendAt = obj?obj.sendAt:''
        this.sendAtTime = obj?obj.sendAtTime:''
        this.timestamp = obj?obj.timestamp:0;
        this.reaction = obj?obj.reaction:''
        this.isOwn = obj?obj.isOwn:false
        this.isAnswered = obj?obj.isAnswered:false
        this.isThread = obj?obj.isThread:false
        this.isInThread = obj?obj.isInThread:false
    }
    
}

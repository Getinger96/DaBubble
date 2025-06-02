export class ConversationMessage {
    id: string;
    senderId: string;
    text: string;
    timestamp: Date |string;
    isOwn: boolean;
    conversationmessageId:string;
    isThread: boolean;
    isInThread: boolean;
    threadTo: string;
    threadCount: number;
    avatar: number;
    name: string;


    constructor(obj?:any){
        this.id = obj ? obj.id : ''
        this.senderId = obj ? obj.senderId: '' ;
        this.text = obj ? obj.text : '';
        this.timestamp = obj ? obj.timestamp : Date; 
        this.isOwn = obj ? obj.isOwn : false;
        this.conversationmessageId=obj?obj.conversationmessageId:''
        this.isThread = obj ? obj.isThread : false;
        this.isInThread = obj ? obj.isInThread : false;
        this.threadTo = obj ? obj.threadTo: '';
        this.threadCount = obj ? obj.threadCount: 0;
        this.avatar = obj ? obj.avatar: 0;
        this.name = obj ? obj.name: '';

    }
}
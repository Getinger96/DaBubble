export class ConversationMessage {
    id: string;
    senderId: string;
    text: string;
    timestamp: Date;
    isOwn: boolean;
    conversationmessageId:string;

    constructor(obj?:any){
        this.id = obj ? obj.id : ''
        this.senderId = obj ? obj.senderID: '' ;
        this.text = obj ? obj.text : '';
        this.timestamp = obj ? obj.timestamp : Date; 
        this.isOwn = obj ? obj.isOwn : false;
        this.conversationmessageId=obj?obj.conversationmessageId:''
    }
}
import { ConversationMessage } from "./conversation-message.interface";

export class Conversation {
    id?:string;
    users: (string | undefined)[];
    conversationMessages:ConversationMessage[] | undefined;

    constructor(obj?:any){
        this.id = obj ? obj.id : '';
        this.users = obj ? obj.users : []; 
        this.conversationMessages = obj ? obj.conversationMessages : []; 
    }
}

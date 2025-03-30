export class Message {
    userId: string;
    messageText: string;
    sendAt: Date;
    reaction: number;


    constructor(
        userId: string,
        messageText: string,
        sendAt: Date,
        reaction: number
    ) {
        this.userId = userId;
        this.messageText = messageText;
        this.sendAt = sendAt;
        this.reaction = reaction;
    }
    
}

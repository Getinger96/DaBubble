

export class Conversation {
    id?:string;
    users: (string | undefined)[];
    

    constructor(obj?:any){
        this.id = obj ? obj.id : '';
        this.users = obj ? obj.user : []; 
       
    }
}

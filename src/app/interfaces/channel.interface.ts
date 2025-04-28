export class Channel {
    id: string;
    name: string;
    description: string;
    members:[];
    creator: string;


    constructor(obj?: any) {
         this.id = obj ? obj.id : ''
        this.name = obj ? obj.name : ''
        this.description = obj ? obj.description : ''
        this.members = obj ? obj.members : ''
        this.creator = obj ? obj.creator : ''

    }



}

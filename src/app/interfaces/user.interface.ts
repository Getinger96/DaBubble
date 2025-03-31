export class User {
    uid:string;
    id:string;
    name:string;
    email:string;
    passwort:string;
    avatar:number;
    status:string;


    constructor(obj?: any){
        this.uid=obj?obj.uid:''
        this.id=obj?obj.id:''
        this.name=obj?obj.name:''
        this.email=obj?obj.email:''
        this.passwort=obj?obj.passwort:''
        this.avatar=obj?obj.avatar:''
        this.status=obj?obj.status:'Offline'
    }
    
}
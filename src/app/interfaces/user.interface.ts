export class User {
    id:string;
    name:string;
    email:string;
    passwort:string;


    constructor(obj?: any){
        this.id=obj?obj.id:''
        this.name=obj?obj.name:''
        this.email=obj?obj.email:''
        this.passwort=obj?obj.passwort:''
    }
    
}
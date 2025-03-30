export class User {
    name:string;
    email:string;
    passwort:string;

    constructor(obj?: any){
        this.name=obj?obj.name:''
        this.email=obj?obj.email:''
        this.passwort=obj?obj.passwort:''
    }
    
}
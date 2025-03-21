import { Injectable, inject } from '@angular/core';
import { Firestore, doc, onSnapshot, updateDoc ,query,where,limit,orderBy} from '@angular/fire/firestore';
import { addDoc, collection, deleteDoc } from '@firebase/firestore';
import { User } from '../interfaces/user.interface';

@Injectable({
    providedIn: 'root'
  })

  export class RegisterService{
    firestore: Firestore = inject(Firestore)



    constructor(){

    }

    ngonDestroy(){

    }

async addUser(item:User){
  await addDoc(this.getUserRef(),item)
}

getUserRef(){
  return collection(this.firestore, 'Users')
}

  }
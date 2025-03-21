import { Injectable, inject } from '@angular/core';
import { Firestore, doc, onSnapshot, updateDoc ,query,where,limit,orderBy} from '@angular/fire/firestore';
import { addDoc, collection, deleteDoc } from '@firebase/firestore';

@Injectable({
    providedIn: 'root'
  })

  export class RegisterService{
    firestore: Firestore = inject(Firestore)
  }
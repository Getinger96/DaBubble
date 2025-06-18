import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, Auth, signInWithPopup, GoogleAuthProvider, linkWithCredential, fetchSignInMethodsForEmail } from '@angular/fire/auth';
import { Firestore, addDoc, updateDoc, query, where, getDoc, } from '@angular/fire/firestore';
import { User } from '../interfaces/user.interface'
import { getDocs } from 'firebase/firestore';
import { RegisterService } from '../firebase-services/register.service';
import { MainComponentService } from './main-component.service';
import { LoginService } from './login.service';
import { JsonDataService } from './json-data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = getAuth();
  private provider = new GoogleAuthProvider();
  allUsers: User[] = [];
  id?: string;
  userExist: boolean = false;
  constructor(

    private router: Router,
    private firestore: Firestore, private registerservice: RegisterService, private mainservice: MainComponentService, private loginservice: LoginService, private jsonservice: JsonDataService) { }

  async loginWithGoogle(event: Event) {
    event.preventDefault();
    try {
      const result = await signInWithPopup(this.auth, this.provider);
      this.loginWithGoogleAccountItWorks(result)

    } catch (error) {
      this.loginWithGoogleAccountError(error);
    }
    return true;
  }


  

  async loginWithGoogleAccountItWorks(result: any) {
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential) {
      const token = credential.accessToken;
      const user = result.user;
      const success = await this.userWithGoogleMail(user);
      return success;
    } else {
      return false;
    }
  }

  async checkIfEmailIsAlreadyUsed() {
    try {
      const userEmail = this.auth.currentUser?.email;
      let userQuery = query(this.registerservice.getUserRef(), where("email", "==", userEmail));
      const querySnapshot = await getDocs(userQuery);

      return !querySnapshot.empty;
    } catch (error) {
      console.error('Fehler beim Überprüfen des Benutzers:', error);
      return false;

    }
  }

  async userWithGoogleMail(user: any) {
    const userEmail = user.email;
    const userExists = await this.loginservice.checkIfUserExists(user.email);

    if (!userExists) {
      console.log('➕ Benutzer existiert NICHT – wird neu erstellt.');
      let newUser = this.jsonservice.newUserWithGoogleMail(user);
      this.addInFirebaseGoogleMailUser(newUser, user.uid);
      this.mainservice.getActualUser(user.uid);
    } else {
      this.mainservice.getActualUser(user.uid);
      this.setStatusOnline(user.uid, 'Online');
      this.mainservice.saveActualUser();
      this.mainservice.acutalUser$.subscribe(user => {
        this.id = user[0].id;
      });
      
    }
  }

  async setStatusOnline(uid: string, newStatus: string) {
    const user = this.mainservice.allUsers.find(user => user.uid === uid);
    if (user) {
      if (user.status !== newStatus) {
        user.status = newStatus;
        let docRef = this.registerservice.getSingleDocRef(user.id);
        await updateDoc(docRef, { status: user.status });
      }
    }
  }

  addInFirebaseGoogleMailUser(item: User, id: string) {
    return addDoc(this.registerservice.getUserRef(), this.jsonservice.userJsonGoogleMail(item, id)).then(async docRef => {
      this.id = docRef.id;
      console.log("Benutzer gespeichert mit ID:", docRef.id);  // Automatisch generierte ID
      await updateDoc(docRef, { id: docRef.id });
      return docRef.id;  // Gibt die automatisch generierte ID zurück
    }).catch(error => {
      console.error("Fehler beim Hinzufügen des Benutzers:", error);
    });
  }

  loginWithGoogleAccountError(error: any) {
    const errorCode = error.code;
    const errorMessage = error.message;
    const email = error.customData?.email;
    const credential = GoogleAuthProvider.credentialFromError(error);
    console.error('Fehlercode:', errorCode);
    console.error('Fehlermeldung:', errorMessage);
    console.error('Benutzer-E-Mail:', email);
  }
}

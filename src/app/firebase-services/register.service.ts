import { Injectable, inject, } from '@angular/core';
import { Firestore, deleteDoc, collection, addDoc, doc, updateDoc, setDoc, query, where, getDocs, onSnapshot } from '@angular/fire/firestore';
import { getAuth, deleteUser, onAuthStateChanged, confirmPasswordReset, createUserWithEmailAndPassword, signInWithPopup, getRedirectResult, GoogleAuthProvider, AuthProvider, sendPasswordResetEmail, reauthenticateWithCredential, updatePassword, signInWithEmailAndPassword } from "firebase/auth";
import { User } from '../interfaces/user.interface';
import { Channel } from '../interfaces/channel.interface';
import { Observable, pipe } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  firestore: Firestore = inject(Firestore); // Initialisiere Firestore
  private auth = getAuth(); // Initialisiere Firebase Auth
  private provider = new GoogleAuthProvider();
  private current = this.auth.currentUser;
  oobCode: string | null = null;
  id?: string;
  uid?: string;
  name?: string;
  userEmailExist?: boolean = false

  constructor(private route: ActivatedRoute,private router: Router) {
    this.route.queryParams.subscribe(params => {
      this.oobCode = params['oobCode'];
    });
  }

  getSingleDocRef(docID: string) {
    return doc(collection(this.firestore, 'Users'), docID);
  }

  async deleteUserFirebase() {
    const currentUser = this.auth.currentUser;
    let userId = this.id
    if (userId) {
      const docRef = this.getSingleDocRef(userId)
      if (currentUser) {
        await deleteUser(currentUser);
        await deleteDoc(docRef);
      }
    }
  }

  async checkIfUserExistsBeforeRegistration(item: User) {
    try {
      let userQuery = query(this.getUserRef(), where("email", "==", item.email))
      const querySnapshot = await getDocs(userQuery);

      if (!querySnapshot.empty) {
        this.userEmailExist = true
        return false
      }
      this.userEmailExist = false;
      return true
    } catch (error) {
      console.error('Fehler beim Überprüfen des Benutzers:', error);
      return false;
    }
  }

  async addNewUser(item: User, event: Event) {
    try {
      event.preventDefault();
      const userCredential = await createUserWithEmailAndPassword(this.auth, item.email, item.passwort);
      if (!await this.checkIfUserExistsBeforeRegistration(item)) {
        return false;
      }
      const user = userCredential.user;
      this.name = item.name;
      this.addInFirebase(item, user.uid);
      this.router.navigate(['/chooseAvatar']);
      return true
    } catch (error) {
      return false;
    }
  }

  async addInFirebase(item: User, uid: string) {
    return addDoc(this.getUserRef(), this.userJson(item, uid)).then(async docRef => {
      this.id = docRef.id;
      this.uid = uid;

      await updateDoc(docRef, { id: docRef.id });
      return docRef.id;
    }).catch(error => {
      console.error("Fehler beim Hinzufügen des Benutzers:", error);
    });
  }

  userJson(item: User, uid: string) {
    return {
      name: item.name,
      email: item.email,
      passwort: item.passwort,
      id: '',
      uid: uid,
      avatar: null,
      status: 'Offline'
    };
  }

  setUserObject(obj: any, id: string): User { // Funktion, um das Benutzerobjekt in das Firestore-Format zu konvertieren
    return {
      uid: obj.uid,
      id: id,
      name: obj.name,
      email: obj.email,
      passwort: obj.passwort,
      avatar: obj.avatar,
      status: obj.status
    };
  }

  async updateUserAvatar(avatar: number) {
    try {
      if (!this.id) {
        throw new Error("Fehler: Benutzer-ID nicht gesetzt!");
      }
      const userRef = doc(this.firestore, "Users", this.id);// Verwende setDoc, um sicherzustellen, dass das Dokument existiert oder erstellt wird
      await updateDoc(userRef, { avatar: avatar });
      this.router.navigate(['/']);
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Avatars:", error);
    }
  }

  getUserRef() { // Funktion, um die Referenz auf die Firestore-Sammlung 'Users' zu bekommensetUserObject
    return collection(this.firestore, 'Users');
  }

  sendEmailforPasswordreset(item: User) {
    sendPasswordResetEmail(this.auth, item.email)
      .then(() => {
        // Password reset email sent!
        // ..
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
      });

  }

  resetPassword(newPasswort: any, confirmedPasswort: any): void {
    if (this.oobCode && newPasswort === confirmedPasswort) {
     
      const auth = getAuth(); // Passwort nur zurücksetzen, wenn der oobCode vorhanden und die Passwörter übereinstimmen
      confirmPasswordReset(auth, this.oobCode, newPasswort)
        .then(() => {
          alert('Ihr Passwort wurde erfolgreich zurückgesetzt!');
          this.router.navigate(['/login']); // Weiterleitung zur Login-Seite
        })
        .catch((error) => {
          // Fehlerbehandlung
          alert(`Fehler: ${error.message}`);
        });
    } else {
      alert('Die Passwörter stimmen nicht überein!');
    }
  }
}

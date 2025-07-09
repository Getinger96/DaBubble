import { Injectable, inject, } from '@angular/core';
import { Firestore, deleteDoc, collection, addDoc, getDoc, doc, updateDoc, setDoc, query, where, getDocs, onSnapshot, arrayUnion } from '@angular/fire/firestore';
import { getAuth, deleteUser, onAuthStateChanged, confirmPasswordReset, createUserWithEmailAndPassword, signInWithPopup, getRedirectResult, GoogleAuthProvider, AuthProvider, sendPasswordResetEmail, reauthenticateWithCredential, updatePassword, signInWithEmailAndPassword } from "firebase/auth";
import { User } from '../interfaces/user.interface';
import { ChannelMember } from '../interfaces/ChannelMember.interface';
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
  userNameExist?: boolean = false

  constructor(private route: ActivatedRoute, private router: Router) {
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

  async checkIfUserNameExistsBeforeRegistration(item: User) {
    try {
      let userQuery = query(this.getUserRef(), where("name", "==", item.name))
      const querySnapshot = await getDocs(userQuery);

      if (!querySnapshot.empty) {
        this.userNameExist = true
        return false
      }
      this.userNameExist = false;
      return true
    } catch (error) {
      console.error('Fehler beim Überprüfen des Benutzers:', error);
      return false;
    }
  }

 async addNewUser(item: User, event: Event) {
  try {
    event.preventDefault();

    const emailOk = await this.checkIfUserExistsBeforeRegistration(item);
    const nameOk = await this.checkIfUserNameExistsBeforeRegistration(item);

    if (!emailOk) {
      return false;
    }
    if (!nameOk) {
      return false;
    }

    const userCredential = await createUserWithEmailAndPassword(this.auth, item.email, item.passwort);

    const user = userCredential.user;
    this.name = item.name;
    localStorage.setItem('registerName', this.name);


    await this.addInFirebase(item, user.uid); // await falls addInFirebase async ist


  

    return true;

  } catch (error) {
    console.error('Firebase Fehler bei Registrierung:', error);
    return false;
  }
}

  getChannelRef() {
    return collection(this.firestore, 'Channels');
  }

  async addUserToChannel(channelId: string, user: ChannelMember): Promise<void> {
    const channelRef = doc(this.firestore, `Channels/${channelId}`);

    const memberData = {
      id: user.id,
      name: user.name,
      status: user.status || 'Offline',
      avatar: user.avatar || 0,
    };

    try {
      await updateDoc(channelRef, {
        members: arrayUnion(memberData)
      });
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Mitglieds zum Channel:', error);
    }
  }

  async addInFirebase(item: User, uid: string) {
    return addDoc(this.getUserRef(), this.userJson(item, uid)).then(async docRef => {
      this.id = docRef.id;
      localStorage.setItem('registerId', this.id);
      this.uid = uid;

      await updateDoc(docRef, { id: docRef.id });

      const channelId = 'BLDNqmQQWm4Qqv4NLNbv'; // oder dynamisch setzen
      await this.addUserToChannel(channelId, {
        id: docRef.id,
        name: item.name,
        status: 'Online',
        avatar: item.avatar || 1,
      });

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
      avatar: 1,
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

  async updateUserAvatar(avatar: number, name: string) {
    try {
      if (!this.id) {
        this.id = localStorage.getItem('registerId') || ''
      }
      const userRef = doc(this.firestore, "Users", this.id);// Verwende setDoc, um sicherzustellen, dass das Dokument existiert oder erstellt wird
      await updateDoc(userRef, { avatar: avatar });
      await this.updateDocInMainChannel(avatar, name)
      this.router.navigate(['/']);
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Avatars:", error);
    }
  }

  async updateDocInMainChannel(avatar: number, name: string) {
    const channelId = 'BLDNqmQQWm4Qqv4NLNbv';
    const channelRef = doc(this.firestore, `Channels/${channelId}`);
    const channSnap = await getDoc(channelRef);
    const data = channSnap.data();
    const members = data?.['members'];

    for (let i = 0; i < members.length; i++) {
      if (members[i].name === name && members[i].avatar === 1) {
        members[i].avatar = avatar;
        break;
      }
    }
    await updateDoc(channelRef, { members });
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

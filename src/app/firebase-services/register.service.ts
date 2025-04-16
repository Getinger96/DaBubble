import { Injectable, inject, } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc, setDoc, query, where, getDocs, onSnapshot } from '@angular/fire/firestore';
import { getAuth, onAuthStateChanged, confirmPasswordReset, createUserWithEmailAndPassword, signInWithPopup, getRedirectResult, GoogleAuthProvider, AuthProvider, sendPasswordResetEmail, reauthenticateWithCredential, updatePassword, signInWithEmailAndPassword } from "firebase/auth";
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
  // Initialisiere Firestore
  firestore: Firestore = inject(Firestore);

  // Initialisiere Firebase Auth
  private auth = getAuth();
  private provider = new GoogleAuthProvider();
  private current = this.auth.currentUser;
  oobCode: string | null = null;
  id?: string;
  name?: string;
  unsubList;
  unsubChannel;
  allUsers: User[] = [];
  actualUser: User[] = [];
  allChannels: Channel[] = [];
  loginIsValide: boolean = true
  loginIsEmailValide: boolean = true
  private allUsersSubject = new BehaviorSubject<User[]>([]);
  private actualUserSubject = new BehaviorSubject<User[]>([])
  allUsers$ = this.allUsersSubject.asObservable();
  acutalUser$ = this.actualUserSubject.asObservable();

  constructor(private route: ActivatedRoute,
    private router: Router) {
    this.unsubList = this.subList();
    this.unsubChannel = this.subChannelList()
    this.saveActualUser();
    this.route.queryParams.subscribe(params => {
      this.oobCode = params['oobCode'];
    });


  }


  async saveActualUser() {
    try {
      // 1. Hole den aktuellen Benutzer. Wir warten darauf, dass die Benutzerinfo geladen wird.
      let currentUser = await this.getCurrentUser();
      if (currentUser) {
        // 2. Wenn der Benutzer eingeloggt ist (d.h. "currentUser" ist nicht null), 
        //    warte darauf, dass alle Benutzer aus der Firestore-Datenbank geladen sind.
        this.allUsers$
          .pipe(
            filter(users => users.length > 0)  // Warte, bis mindestens ein Benutzer geladen wurde
          )
          .subscribe(users => {
            // 3. Wenn mindestens ein Benutzer geladen ist, verarbeite den Benutzer, z.B. mit einer Methode.
            console.log('Alle Benutzer:', users);
            this.getActualUser(currentUser.uid);  // Hier kannst du eine Methode aufrufen, um den aktiven Benutzer zu finden
          });
      } else {
        // 4. Wenn der Benutzer nicht eingeloggt ist, setze den Benutzerstatus auf leer.
        this.actualUserSubject.next([]);
        console.log('Kein Benutzer eingeloggt', this.actualUserSubject);
      }
    } catch (error) {
      console.error("Fehler beim Abrufen des Benutzers:", error);
    }
  }

  // Methode, die den aktuellen Benutzer zurückgibt
  getCurrentUser(): Promise<any> {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe(); // Entfernt den Listener, sobald wir die Info haben
        resolve(user);  // Gibt den Benutzer zurück
      }, reject); // Fehlerbehandlung, falls etwas schiefgeht
    })

  }



  subList() {
    return onSnapshot(this.getUserRef(), (user) => {
      let usersArray: User[] = [];
      user.forEach(element => {
        usersArray.push(this.setUserObject(element.data(), element.id))
        console.log('Daten in Firebase', element.data(), element.id)
      })
      this.allUsers = usersArray;
      this.allUsersSubject.next(this.allUsers);
      console.log(this.allUsers);
    })
  }

  subChannelList() {
    return onSnapshot(this.getChannelRef(), (channel) => {
      let channelssArray: Channel[] = [];
      channel.forEach(element => {
        channelssArray.push(this.setChannelObject(element.data(),element.id))
        console.log('Daten in Firebase', element.data())
      })
      this.allChannels = channelssArray
      console.log(this.allChannels)

    })
  }

  ngonDestroy() {
    this.unsubList();
    this.unsubChannel();
  }



  async checkIfUserExists(email: string): Promise<boolean> {
    try {
      let userQuery = query(this.getUserRef(), where("email", "==", email))
      const querySnapshot = await getDocs(userQuery);
      return !querySnapshot.empty;

    } catch (error) {
      console.error('Fehler beim Überprüfen des Benutzers:', error);
      return false;
    }
  }


  async loginUser(email: string, password: string, event: Event) {
    event.preventDefault();

    try {
      const userExists = await this.checkIfUserExists(email);
      if (!userExists) {
        console.error('❌ Benutzer existiert nicht.');
        this.loginIsEmailValide = false;
        return;
      }
      this.loginIsEmailValide = true;
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('✅ Erfolgreich angemeldet:', userCredential.user);
      this.loginIsValide = true;

      onAuthStateChanged(this.auth, (user) => {

        if (user) {
          console.log('✅ Benutzerstatus bestätigt:', user, user.uid);

          this.updateStatusByUid(user.uid, 'Online')
          this.getActualUser(user.uid)


          setTimeout(() => {
            this.router.navigate(['/main-components']);
          }, 3000);

        }

      });
    } catch (error: any) {
      console.error('❌ Fehler bei der Anmeldung:', error);
      this.loginIsValide = false;

    }
  }

  getActualUser(uid: string) {
    const user = this.allUsers.find(user => user.uid === uid);
    this.actualUser = []
    if (user) {
      // Wenn der User gefunden wird, den Status ändern

      this.actualUser.push(user)
      this.actualUserSubject.next(this.actualUser);
      console.log('akutler User, USer ', this.actualUserSubject, this.actualUser);


    } else {
      console.log('Kein User mit dieser UID gefunden');
    }

  }










  async updateStatusByUid(uid: string, newStatus: string): Promise<void> {
    // Suche nach dem User mit der entsprechenden UID
    const user = this.allUsers.find(user => user.uid === uid);

    if (user) {
      // Wenn der User gefunden wird, den Status ändern
      user.status = newStatus;
      let docRef = this.getSingleDocRef(user.id)
      await updateDoc(docRef, { status: user.status });
      console.log('Status aktualisiert:', user);
    } else {
      console.log('Kein User mit dieser UID gefunden');
    }
  }

  getSingleDocRef(docID: string) {
    return doc(collection(this.firestore, 'Users'), docID);

  }




  async addNewUser(item: User, event: Event) {
    try {
      event.preventDefault();
      const userCredential = await createUserWithEmailAndPassword(this.auth, item.email, item.passwort);
      const user = userCredential.user;
      this.name = item.name;
      this.addInFirebase(item, user.uid);
      console.log("Benutzer erfolgreich registriert und in Firestore gespeichert");
      this.router.navigate(['/chooseAvatar']);
    } catch (error) {
      console.error("Fehler bei der Registrierung oder beim Speichern in Firestore:", error);
    }
  }

  addInFirebase(item: User, id: string) {
    return addDoc(this.getUserRef(), this.userJson(item, id)).then(docRef => {
      this.id = docRef.id;
      console.log("Benutzer gespeichert mit ID:", docRef.id);  // Automatisch generierte ID
      return docRef.id;  // Gibt die automatisch generierte ID zurück
    }).catch(error => {
      console.error("Fehler beim Hinzufügen des Benutzers:", error);
    });
  }

  addChannel(item: Channel, event: Event) {
    return addDoc(this.getChannelRef(), this.channelJson(item, this.actualUser[0].name))
  }

  channelJson(item: Channel, creator: string) {
    return {
      id:item.id,
      name: item.name,
      members: [],
      creator: creator,
      description: item.description

    }
  }

  userJson(item: User, id: string) {
    return {
      name: item.name,
      email: item.email,
      passwort: item.passwort,
      id: id,
      uid: item.uid,
      avatar: null,
      status: 'Offline'
    };
  }
  // Funktion, um das Benutzerobjekt in das Firestore-Format zu konvertieren
  setUserObject(obj: any, id: string): User {
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

  setChannelObject(obj: any,id:string): Channel {
    return {
      id:id,
      name: obj.name,
      members: obj.members,
      creator: obj.creator,
      description: obj.description
    };
  }

  async updateUserAvatar(avatar: number) {
    try {
      if (!this.id) {
        throw new Error("Fehler: Benutzer-ID nicht gesetzt!");
      }

      const userRef = doc(this.firestore, "Users", this.id);

      // Verwende setDoc, um sicherzustellen, dass das Dokument existiert oder erstellt wird
      await updateDoc(userRef, { avatar: avatar });

      console.log("Avatar erfolgreich aktualisiert");
      this.router.navigate(['/']);
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Avatars:", error);
    }
  }



  // Funktion, um die Referenz auf die Firestore-Sammlung 'Users' zu bekommensetUserObject
  getUserRef() {
    return collection(this.firestore, 'Users');
  }

  getChannelRef() {
    return collection(this.firestore, 'Channels');
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
      // Passwort nur zurücksetzen, wenn der oobCode vorhanden und die Passwörter übereinstimmen
      const auth = getAuth();
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


  async addMembersToChannel(channelId: string, members: string[]) {
    const channelDocRef = doc(this.firestore, 'Channels', channelId);
    await updateDoc(channelDocRef, {
      members: members
    });
    console.log('✅ Mitglieder wurden zum Channel hinzugefügt');
  }

}



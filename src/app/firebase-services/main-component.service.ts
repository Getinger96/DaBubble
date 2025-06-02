import { Injectable, inject } from '@angular/core';
import { collection, Firestore, onSnapshot, doc, getDoc } from '@angular/fire/firestore';
import { User } from '../interfaces/user.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { getAuth, onAuthStateChanged } from '@angular/fire/auth';
import { BehaviorSubject, filter } from 'rxjs';
import { ConversationMessage } from '../interfaces/conversation-message.interface';
import { AngularFirestore } from '@angular/fire/compat/firestore';



@Injectable({
  providedIn: 'root'
})

export class MainComponentService {
  firestore: Firestore = inject(Firestore);
  actualUser: User[] = [];
  unsubList;
  allUsers: User[] = [];
  private allUsersSubject = new BehaviorSubject<User[]>([]);
  allUsers$ = this.allUsersSubject.asObservable();
  private actualUserSubject = new BehaviorSubject<User[]>([])
  acutalUser$ = this.actualUserSubject.asObservable();
  private auth = getAuth();
  showdirectmessage: boolean = false;
  public directmessaeUserNameSubject = new BehaviorSubject<string>('');
  currentusermessageName$ = this.directmessaeUserNameSubject.asObservable();
  public directmessaeUserAvatarSubject = new BehaviorSubject<number>(0);
  currentusermessagAvatar$ = this.directmessaeUserAvatarSubject.asObservable();
  private directmessaeUserEmailSubject = new BehaviorSubject<string>('');
  currentusermessagEmail$ = this.directmessaeUserEmailSubject.asObservable();
  private directmessaeUserStatusSubject = new BehaviorSubject<string>('');
  currentusermessagStatus$ = this.directmessaeUserStatusSubject.asObservable();
  public directmessaeUserIdSubject = new BehaviorSubject<string>('');
  currentusermessagId$ = this.directmessaeUserStatusSubject.asObservable();
   private allDirectMessagesSubject = new BehaviorSubject<ConversationMessage[]>([]);
  allDirectMessages$ = this.allDirectMessagesSubject.asObservable();


    public userStatusSubject = new BehaviorSubject<string>('');
  userStatus$ = this.userStatusSubject.asObservable();

    public userSubjectId = new BehaviorSubject<string>('');
 userId$ = this.userSubjectId.asObservable();

    public userSubjectEmail = new BehaviorSubject<string>('');
 userEmail$ = this.userSubjectEmail.asObservable();

public userSubjectAvatar = new BehaviorSubject<number | null>(null);
 userAvatar$ = this.userSubjectAvatar.asObservable();


     public userSubjectName = new BehaviorSubject<string>('');
 userName$ = this.userSubjectName.asObservable();


  constructor(private route: ActivatedRoute,
    private router: Router) {
    this.unsubList = this.subList();
  }

  
 getUserById(userId: string): User | undefined {
    return this.allUsers.find(user => user.id === userId);
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

  ngonDestroy() {
    this.unsubList();
  }

  setDirectmessageuserName(name: string): void {
    this.directmessaeUserNameSubject.next(name)
  }
  setDirectmessageuserAvatar(avatar: number): void {
    this.directmessaeUserAvatarSubject.next(avatar)
  }
  setDirectmessageuserEmail(email: string): void {
    this.directmessaeUserEmailSubject.next(email)
  }
  setDirectmessageuserStatus(status: string): void {
    this.directmessaeUserStatusSubject.next(status)
  }
  setDirectmessageuserId(id: string): void {
    this.directmessaeUserIdSubject.next(id)
  }

  
  


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

  getUserRef() {
    return collection(this.firestore, 'Users');
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


  async getUserDataFromFirebase(userId: string) {
        const channelDocRef = doc(this.firestore, 'Users', userId);
        const docSnap = await getDoc(channelDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const  userStatus = data['status'];
          const  userId = data['id'];
          const  userEmail = data['email'];
          const  userAvatar = data['avatar'];
          const  userName = data['name'];
          this.userStatusSubject.next(userStatus)
          this.userSubjectId.next(userId)
          this.userSubjectEmail.next(userEmail)
          this.userSubjectAvatar.next(userAvatar)
           this.userSubjectName.next(userName)
  } 

}

}
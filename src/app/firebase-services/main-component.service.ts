import { Injectable, inject } from '@angular/core';
import { collection, Firestore, onSnapshot, doc, getDoc } from '@angular/fire/firestore';
import { User } from '../interfaces/user.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { getAuth, onAuthStateChanged } from '@angular/fire/auth';
import { BehaviorSubject, filter, Subject } from 'rxjs';
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
  showThreadWindow: boolean = false;
  public actualUserSubject = new BehaviorSubject<User[]>([])
  acutalUser$ = this.actualUserSubject.asObservable();
  private auth = getAuth();
  showdirectmessage: boolean = false;
  showmainchat: boolean = true

  public directmessaeUserNameSubject = new BehaviorSubject<string>('');
  currentusermessageName$ = this.directmessaeUserNameSubject.asObservable();
  public directmessaeUserAvatarSubject = new BehaviorSubject<number>(0);
  currentusermessagAvatar$ = this.directmessaeUserAvatarSubject.asObservable();
  private directmessaeUserEmailSubject = new BehaviorSubject<string>('');
  currentusermessagEmail$ = this.directmessaeUserEmailSubject.asObservable();
  private directmessaeUserStatusSubject = new BehaviorSubject<string>('');
  currentusermessagStatus$ = this.directmessaeUserStatusSubject.asObservable();
  public directmessaeUserIdSubject = new BehaviorSubject<string>('');
  currentusermessagId$ = this.directmessaeUserIdSubject.asObservable();
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
  toggleThreadSignal = new Subject<void>();
  loadActualUser: boolean = false;
  public userIdSubject = new BehaviorSubject<string>('');
  userIdActual$ = this.userIdSubject.asObservable();

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
      })
      this.allUsers = usersArray;
      this.allUsersSubject.next(this.allUsers);
    })
  }

  ngonDestroy() {
    this.unsubList();
  }

  toggleShowDirectMessage() {
    this.showdirectmessage = !this.showdirectmessage;
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

  setCurrentDirectMessage(directMessageId: string) {
    const directMessageDocRef = doc(this.firestore, 'Users', directMessageId);
    getDoc(directMessageDocRef).then((docSnap) => {
      if (docSnap.exists()) {
        const user = docSnap.data() as User;
        this.directmessaeUserNameSubject.next(user.name)
        this.directmessaeUserAvatarSubject.next(user.avatar)
        this.directmessaeUserEmailSubject.next(user.email)
        this.directmessaeUserStatusSubject.next(user.status)
      } else {
        console.warn('⚠️ Channel nicht gefunden:', directMessageId);
      }
    }).catch(error => {
      console.error('❌ Fehler beim Laden des Channels:', error);
    });
  }

  setDirectmessageuserId(id: string): void {
    this.directmessaeUserIdSubject.next(id);
    this.getUserDataFromFirebase(id);
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
      let currentUser = await this.getCurrentUser();
      if (currentUser) {
        this.allUsers$
          .pipe(
            filter(users => users.length > 0)  
          )
          .subscribe(users => {
            this.getActualUser(currentUser.uid);  
          });
      } else {
        this.actualUserSubject.next([]);
      }
    } catch (error) {
      console.error("Fehler beim Abrufen des Benutzers:", error);
    }
  }

  getCurrentUser(): Promise<any> {// Methode, die den aktuellen Benutzer zurückgibt
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
    if (user) {  // Wenn der User gefunden wird, den Status ändern
      this.actualUser.push(user)
      this.actualUserSubject.next(this.actualUser)
    }
  }

  async getUserDataFromFirebase(userId: string) {
    const channelDocRef = doc(this.firestore, 'Users', userId);
    const docSnap = await getDoc(channelDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const userStatus = data['status'];
      const userId = data['id'];
      const userEmail = data['email'];
      const userAvatar = data['avatar'];
      const userName = data['name'];
      this.userStatusSubject.next(userStatus)
      this.userSubjectId.next(userId)
      this.userSubjectEmail.next(userEmail)
      this.userSubjectAvatar.next(userAvatar)
      this.userSubjectName.next(userName)
    }
  }
}
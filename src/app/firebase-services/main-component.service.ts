import { Injectable, inject } from '@angular/core';
import { collection, Firestore, onSnapshot } from '@angular/fire/firestore';
import { User } from '../interfaces/user.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { getAuth, onAuthStateChanged } from '@angular/fire/auth';
import { BehaviorSubject, filter } from 'rxjs';



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



    constructor(private route: ActivatedRoute,
        private router: Router) {
        this.unsubList = this.subList();

        this.saveActualUser();



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

}
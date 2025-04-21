import { Injectable, inject, } from '@angular/core';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from '@angular/fire/auth';
import { collection, doc, Firestore, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { MainComponentService } from './main-component.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../interfaces/user.interface';

@Injectable({
    providedIn: 'root'
  })



export class LoginService{
firestore: Firestore = inject(Firestore);
loginIsEmailValide: boolean = true
private auth = getAuth();
loginIsValide: boolean = true
overlayvisible: boolean = false
allUsers: User[] = [];


 constructor(private route: ActivatedRoute,private mainservice:MainComponentService,private router: Router) {
      
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
      this.overlayvisible = true;
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('✅ Erfolgreich angemeldet:', userCredential.user);
      this.loginIsValide = true;

      onAuthStateChanged(this.auth, (user) => {

        if (user) {
          console.log('✅ Benutzerstatus bestätigt:', user, user.uid);

          this.updateStatusByUid(user.uid, 'Online')
          this.mainservice.getActualUser(user.uid)
          this.mainservice.saveActualUser();

          setTimeout(() => {
            this.overlayvisible = false;
            this.router.navigate(['/main-components']);
          }, 3000);

        }

      });
    } catch (error: any) {
      console.error('❌ Fehler bei der Anmeldung:', error, error.message);
      this.loginIsValide = false;

    }
  }

  getUserRef() {
      return collection(this.firestore, 'Users');
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

}
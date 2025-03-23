import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, UserCredential, getAdditionalUserInfo, signInWithRedirect, getRedirectResult, AuthProvider } from "firebase/auth";
import { User } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  // Initialisiere Firestore
  firestore: Firestore = inject(Firestore);

  // Initialisiere Firebase Auth
  private auth = getAuth();
  private provider = new GoogleAuthProvider();
  
  



  constructor() {

  }

  // Funktion, um einen neuen Benutzer zu registrieren
  addNewUser(item: User) {
    // Versuche, den Benutzer mit der E-Mail und dem Passwort zu erstellen
    createUserWithEmailAndPassword(this.auth, item.email, item.passwort)
      .then((userCredential) => {
        // Benutzer erfolgreich erstellt
        const user = userCredential.user;

        // Speichere den Benutzer in Firestore
        addDoc(this.getUserRef(), {
          name: item.name,
          email: item.email,

          uid: user.uid // Speichere auch die UID des Benutzers
        })
          .then(() => {
            console.log("Benutzer erfolgreich registriert und in Firestore gespeichert");
          })
          .catch((firestoreError) => {
            // Optional: Fehler beim Speichern in Firestore
            console.error("Fehler beim Speichern des Benutzers in Firestore:", firestoreError);
          });
      })
      .then(() => {
        // Optionale Success-Logik nach erfolgreicher Registrierung
        console.log("Benutzer erfolgreich erstellt.");
      });
  }



  // Funktion, um die Referenz auf die Firestore-Sammlung 'Users' zu bekommen
  getUserRef() {
    return collection(this.firestore, 'Users');
  }

  // Funktion, um das Benutzerobjekt in das Firestore-Format zu konvertieren
  setUserObject(obj: any): User {
    return {
      name: obj.name,
      email: obj.email,
      passwort: obj.passwort
    };
  }

   async loginWithGoogle(event: Event) {
    event.preventDefault();  
    this.provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    
    // Anmeldung mit Google Popup
    await signInWithPopup(this.auth,this.provider)
      .then((result) => {
        // Dies gibt dir das Google Access Token, das du verwenden kannst, um auf die Google API zuzugreifen
        const credential = GoogleAuthProvider.credentialFromResult(result);
  
        // Nullprüfung: Vergewissere dich, dass credential nicht null ist
        if (credential) {
          const token = credential.accessToken;
          const user = result.user;
  
          console.log('Token:', token);
          console.log('Benutzer:', user);
  
          // Weitere Benutzerinformationen könnten hier hinzugefügt werden, z.B.:
          // const additionalUserInfo = getAdditionalUserInfo(result);
          // console.log('Zusätzliche Benutzerinformationen:', additionalUserInfo);
        } else {
          console.error('Kein gültiges Anmelde-Token erhalten.');
        }
      })
      .catch((error) => {
        // Fehlerbehandlung
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData?.email; // optional, falls vorhanden
        const credential = GoogleAuthProvider.credentialFromError(error);
  
        console.error('Fehlercode:', errorCode);
        console.error('Fehlermeldung:', errorMessage);
        console.error('Benutzer-E-Mail:', email);
      });
  }

}





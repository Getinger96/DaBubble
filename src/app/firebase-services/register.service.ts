import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc, setDoc } from '@angular/fire/firestore';
import { getAuth,confirmPasswordReset, createUserWithEmailAndPassword, signInWithPopup, getRedirectResult, GoogleAuthProvider, AuthProvider,sendPasswordResetEmail,reauthenticateWithCredential,updatePassword } from "firebase/auth";
import { User } from '../interfaces/user.interface';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

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


  constructor( private route: ActivatedRoute,
    private router: Router) {
      this.route.queryParams.subscribe(params => {
        this.oobCode = params['oobCode'];
      });
    }

  

  async addNewUser(item: User, event: Event) {
    try {
      event.preventDefault();
      const userCredential = await createUserWithEmailAndPassword(this.auth, item.email, item.passwort);
      const user = userCredential.user;
      this.name =  item.name;
      this.addInFirebase(item, user.uid);
      console.log("Benutzer erfolgreich registriert und in Firestore gespeichert");
      this.router.navigate(['/chooseAvatar']);
    } catch (error) {
      console.error("Fehler bei der Registrierung oder beim Speichern in Firestore:", error);
    }
  }

  addInFirebase(item: User, id: string) {
    return addDoc(this.getUserRef(), this.userJson(item, id)).then(docRef => {
      this.id =  docRef.id;
      console.log("Benutzer gespeichert mit ID:", docRef.id);  // Automatisch generierte ID
      return docRef.id;  // Gibt die automatisch generierte ID zurück
    }).catch(error => {
      console.error("Fehler beim Hinzufügen des Benutzers:", error);
    });
  }

userJson(item: User, id:string) {
  return {
    name: item.name,
    email: item.email,
    passwort: item.passwort,
    uid:id,
    avatar: null,
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
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Avatars:", error);
  }
}

// Diese Funktion wird aufgerufen, wenn der Benutzer den Google-Login-Button klickt.
// Der "event" Parameter enthält das Klick-Ereignis, das wir zunächst unterdrücken,
// um zu verhindern, dass z. B. ein Formular abgeschickt wird.
async loginWithGoogle(event: Event) { 
  event.preventDefault();  // Verhindert das Standardverhalten (z.B. Seiten-Neuladen bei Formularen)
  try {
    // Öffnet ein Google-Popup-Fenster zur Authentifizierung.
    // signInWithPopup erwartet das Firebase Auth-Objekt (this.auth) und den Google-Provider (this.provider).
    const result = await signInWithPopup(this.auth, this.provider);

    // Erfolgreiche Anmeldung: Übergibt das Ergebnis zur weiteren Verarbeitung
    this.loginWithGoogleAccountItWorks(result);
  } catch (error) {
    // Falls ein Fehler auftritt (z.B. Popup wird geschlossen oder ein Netzwerkfehler),
    // wird der Fehler hier verarbeitet.
    this.loginWithGoogleAccountError(error);
  }
}

// Diese Funktion verarbeitet das erfolgreiche Login-Ergebnis.
loginWithGoogleAccountItWorks(result: any) {
  // Extrahiert aus dem "result" das Credential-Objekt,
  // das wichtige Authentifizierungsdaten enthält.
  // Extrahiert die Google-Anmeldeinformationen (z.B. accessToken) aus dem Anmeldeergebnis.
// Gibt das Credential-Objekt zurück, falls vorhanden, sonst null.

  const credential = GoogleAuthProvider.credentialFromResult(result);

  // Falls das Credential vorhanden ist, können wir das Access Token und den Benutzer abrufen.
  if (credential) {
    // Das Access Token (token) ist ein Sicherheitsschlüssel, der verwendet wird,
    // um auf Google-APIs zuzugreifen, z. B. um auf Google-Kontakte, Kalender oder Drive zuzugreifen.
    const token = credential.accessToken;
    // Das User-Objekt enthält alle relevanten Benutzerdaten, z. B.:
    // - uid: Eine eindeutige Benutzer-ID von Firebase
    // - displayName: Der Anzeigename des Benutzers
    // - email: Die E-Mail-Adresse des Benutzers
    // - photoURL: Die URL zum Profilbild des Benutzers (sofern vorhanden)
    const user = result.user;

    // Ausgabe des Access Tokens und der Benutzerinformationen in der Konsole,
    // um zu überprüfen, dass die Anmeldung erfolgreich war.
    console.log('Token:', token);   // Hier siehst du deinen Sicherheitsschlüssel (Access Token)
    console.log('Benutzer:', user);   // Hier siehst du die Informationen des angemeldeten Benutzers
  } else {
    // Falls kein gültiges Credential (Anmeldeinformationen) vorhanden ist,
    // wird eine Fehlermeldung in der Konsole ausgegeben.
    console.error('Kein gültiges Anmelde-Token erhalten.');
  }
}

// Diese Funktion verarbeitet Fehler, die während des Google-Logins auftreten.
loginWithGoogleAccountError(error: any) {
  // Extrahiert den Fehlercode, der angibt, welche Art von Fehler aufgetreten ist.
  const errorCode = error.code;
  // Extrahiert die detaillierte Fehlermeldung.
  const errorMessage = error.message;
  // Falls vorhanden, extrahiert die E-Mail, mit der versucht wurde sich anzumelden.
  const email = error.customData?.email;
  // Versucht, aus dem Fehler ein Credential-Objekt zu extrahieren (falls vorhanden).
  const credential = GoogleAuthProvider.credentialFromError(error);

  // Ausgabe der Fehlerdetails in der Konsole, um bei der Fehlerbehebung zu helfen.
  console.error('Fehlercode:', errorCode);
  console.error('Fehlermeldung:', errorMessage);
  console.error('Benutzer-E-Mail:', email);
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
sendEmailforPasswordreset(item: User){
  sendPasswordResetEmail(this.auth,item.email)
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


resetPassword(newPasswort: any,confirmedPasswort: any): void {
  if (this.oobCode && newPasswort === confirmedPasswort) {
    // Passwort nur zurücksetzen, wenn der oobCode vorhanden und die Passwörter übereinstimmen
    const auth = getAuth();
    confirmPasswordReset(auth, this.oobCode,newPasswort)
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



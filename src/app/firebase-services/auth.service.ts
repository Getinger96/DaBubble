import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, Auth, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';
import { Firestore, addDoc, updateDoc, query, where, getDoc } from '@angular/fire/firestore';
import { User } from '../interfaces/user.interface'
import { getDocs } from 'firebase/firestore';
import { RegisterService } from '../firebase-services/register.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = getAuth();
  private provider = new GoogleAuthProvider();
  allUsers: User[] = [];
  id?: string;
  userExist : boolean = false;
  constructor( 
    
    private router: Router,
    private firestore: Firestore, private registerservice: RegisterService) { }





    async loginWithGoogle(event: Event) {
        event.preventDefault();  // Verhindert das Standardverhalten (z.B. Seiten-Neuladen bei Formularen)
        try {
          // Öffnet ein Google-Popup-Fenster zur Authentifizierung.
          // signInWithPopup erwartet das Firebase Auth-Objekt (this.auth) und den Google-Provider (this.provider).
 
          const result = await signInWithPopup(this.auth, this.provider);
          // Erfolgreiche Anmeldung: Übergibt das Ergebnis zur weiteren Verarbeitung
          this.loginWithGoogleAccountItWorks(result)
          this.registerservice.saveActualUser();
          this.router.navigate(['/main-components']);
          
        } catch (error) {
          // Falls ein Fehler auftritt (z.B. Popup wird geschlossen oder ein Netzwerkfehler),
          // wird der Fehler hier verarbeitet.
          this.loginWithGoogleAccountError(error);
        }
        return true;
    }
    
    async loginWithGoogleAccountItWorks(result: any) {
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
    
        const success = await this.userWithGoogleMail(user);
        return success;  // Gibt true oder false zurück
      } else {
        // Falls kein gültiges Credential (Anmeldeinformationen) vorhanden ist,
        // wird eine Fehlermeldung in der Konsole ausgegeben.
        console.error('Kein gültiges Anmelde-Token erhalten.');
        return false;  // Gibt false zurück, falls das Credential nicht vorhanden ist
      }
    }
    
      
    
      async checkIfEmailIsAlreadyUsed() {
        try {
          const userEmail = this.auth.currentUser?.email;
          let userQuery = query(this.registerservice.getUserRef(), where("email", "==", userEmail));
          const querySnapshot = await getDocs(userQuery);
          
          if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            const userData: User = docSnap.data() as User;
      
            // Wenn der avatar-Wert zwischen 2 und 5 liegt, setze userExist auf true und breche die Funktion ab
            if (userData.avatar >= 2 && userData.avatar <= 6) {
              this.userExist = true;
              console.log(' this.userExist',  this.userExist);
              
              return false;
            } else {
              console.log('Benutzer existiert mit Avatar 1, Weiterverarbeitung möglich.');
              return true;
            }
            
          } else {
            console.log('Kein Benutzer gefunden mit dieser E-Mail-Adresse.');
            return true;
          }
        } catch (error) {
          console.error('Fehler beim Überprüfen des Benutzers:', error);
          return false;
  
        }
      }
      
    
      userJsonGoogleMail(item: User, id: string) {
        return {
          name: item.name,
          email: item.email,
          passwort: item.passwort,
          id: '',
          uid: item.uid,
          avatar: 1,
          status: 'Online'
        };
      }
    
      async userWithGoogleMail(user: any) {
        console.log('🔍 userWithGoogleMail aufgerufen mit:', user);
    
        // Wichtig: Nutze "user.email", nicht "user.mail", sonst ist es immer undefined!
        const userEmail = user.email;
        const userExists = await this.registerservice.checkIfUserExists(user.email);
        console.log('📬 E-Mail zum Prüfen:', userEmail);
        console.log('✅ Benutzer existiert bereits?', userExists);
        
        if (!userExists) {
          console.log('➕ Benutzer existiert NICHT – wird neu erstellt.');

          let newUser = this.newUserWithGoogleMail(user);
          console.log('📦 Neuer User zum Speichern:', newUser);
    
          this.addInFirebaseGoogleMailUser(newUser, user.uid);
          this.registerservice.getActualUser(user.uid);
          console.log('🚀 addInFirebaseGoogleMailUser wurde aufgerufen mit:', newUser, user.uid);

          } else {
    
          this.registerservice.getActualUser(user.uid);
          this.setStatusOnline(user.uid, 'Online')
          console.log('🛑 Benutzer existiert bereits – kein neuer Eintrag.', userExists);
        }
      }
        
      




    
      async setStatusOnline(uid: string, newStatus: string) {
        const user = this.registerservice.allUsers.find(user => user.uid === uid);
      console.log('user', user );
      
        if (user) {
          if (user.status !== newStatus) {
            user.status = newStatus;
            let docRef = this.registerservice.getSingleDocRef(user.id);
            await updateDoc(docRef, { status: user.status });
            console.log('✅ Status aktualisiert:', user);
          } else {
            console.log('ℹ️ Status ist bereits aktuell – keine Änderung nötig.');
          }
        } else {
          console.log('❌ Kein User mit dieser UID gefunden:', uid);
        }
      }
      
    
    
    
    
    
      addInFirebaseGoogleMailUser(item: User, id: string) {
        return addDoc(this.registerservice.getUserRef(), this.userJsonGoogleMail(item, id)).then( async docRef => {
          this.id = docRef.id;
          console.log("Benutzer gespeichert mit ID:", docRef.id);  // Automatisch generierte ID
          await updateDoc(docRef, { id: docRef.id });
          return docRef.id;  // Gibt die automatisch generierte ID zurück
        }).catch(error => {
          console.error("Fehler beim Hinzufügen des Benutzers:", error);
        });
      }
    
    
      newUserWithGoogleMail(user: any) {
        return {
          uid: user.uid,
          id: '',
          name: user.displayName || 'Unbekannt',
          email: user.email || '',
          passwort: '',
          avatar: 0,
          status: 'Online'
    
        };
    
    
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
    
    
 








}

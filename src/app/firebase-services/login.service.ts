import { Injectable, inject, } from '@angular/core';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from '@angular/fire/auth';
import { collection, doc, Firestore, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { MainComponentService } from './main-component.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../interfaces/user.interface';
import { RegisterService } from './register.service';
import { ChannelMember } from '../interfaces/ChannelMember.interface';

@Injectable({
  providedIn: 'root'
})


export class LoginService {
  firestore: Firestore = inject(Firestore);
  loginIsEmailValide: boolean = true
  private auth = getAuth();
  loginIsValide: boolean = true
  overlayvisible: boolean = false
  loginoverlay:boolean=false
  allUsers: User[] = [];


  constructor(private route: ActivatedRoute, private mainservice: MainComponentService, private router: Router) {

  }

  async loginUser(email: string, password: string, event: Event) {
    event.preventDefault();

    try {
      if (!(await this.isUserValid(email))) return;
      const userCredential = await this.authenticateUser(email, password);
      await this.handleUserAuthState(userCredential.user);
    } catch (error: any) {
      console.error('❌ Fehler bei der Anmeldung:', error.message);
      this.loginIsValide = false;
    }
  }

  private async isUserValid(email: string): Promise<boolean> {
    const userExists = await this.checkIfUserExists(email);
    if (!userExists) {
      console.error('❌ Benutzer existiert nicht.');
      this.loginIsEmailValide = false;
      return false;
    }
    this.loginIsEmailValide = true;
    this.overlayvisible = true;
    return true;
  }

  private async authenticateUser(email: string, password: string) {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  private async handleUserAuthState(user: any) {
    this.updateStatusByUid(user.uid, 'Online');
       await this.updateStatusInChannels(user.id, 'Online');
    this.mainservice.saveActualUser();
    this.mainservice.getActualUser(user.uid);

    let id: string;
    this.mainservice.acutalUser$.subscribe(user => {
      id = user[0].id;
    });
  }

  getUserRef() {
    return collection(this.firestore, 'Users');
  }

  async checkIfUserExists(email: string): Promise<boolean> {
    try {
      let userQuery = query(this.getUserRef(), where("email", "==", email))
      const querySnapshot = await getDocs(userQuery);
      const snapshot = await getDocs(this.getUserRef());
      return !querySnapshot.empty;

    } catch (error) {
      console.error('Fehler beim Überprüfen des Benutzers:', error);
      return false;
    }
  }

  async updateStatusByUid(uid: string, newStatus: string): Promise<void> {
    const user = this.mainservice.allUsers.find(user => user.uid === uid); // Suche nach dem User mit der entsprechenden UID
    if (user) { // Wenn der User gefunden wird, den Status ändern
      if (user.status !== newStatus) {
        user.status = newStatus;
        let docRef = this.getSingleDocRef(user.id)
        await updateDoc(docRef, { status: user.status });
      }
    }
  }

  getSingleDocRef(docID: string) {
    return doc(collection(this.firestore, 'Users'), docID);
  }

 async updateStatusInChannels(id: string, newStatus: string): Promise<void> {
    const channelsRef = collection(this.firestore, 'Channels');
    const allChannelsSnapshot = await getDocs(channelsRef);

    const channelsToUpdate: { id: string; members: ChannelMember[] }[] = [];

    allChannelsSnapshot.forEach(channelDoc => {
      const data = channelDoc.data();
      const members = data['members'] as ChannelMember[];
      if (!Array.isArray(members)) return;

      const memberIndex = members.findIndex(m => m.id === id);
      if (memberIndex > -1 && members[memberIndex].status !== newStatus) {
        members[memberIndex].status = newStatus;
        channelsToUpdate.push({ id: channelDoc.id, members });
      }
    });

    for (const channel of channelsToUpdate) {
      const channelDocRef = doc(this.firestore, 'Channels', channel.id);
      await updateDoc(channelDocRef, { members: channel.members });
    }
  }
}
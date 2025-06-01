import { Injectable, inject } from '@angular/core';
import { addDoc, collection, doc, getDocs, Firestore, onSnapshot, updateDoc, DocumentReference, getDoc, deleteDoc, serverTimestamp } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Channel } from '../interfaces/channel.interface';
import { BehaviorSubject, timestamp } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { RegisterService } from './register.service';
import { MainComponentService } from './main-component.service';
import { Member } from '../interfaces/member.interface';



@Injectable({
    providedIn: 'root'
})

export class ChannelService {
    firestore: Firestore = inject(Firestore);
    unsubChannel;
    id?: string;
    allChannels: Channel[] = [];
    actualUser: User[] = [];
    private channelsSubject = new BehaviorSubject<Channel[]>([]);
    public channels$ = this.channelsSubject.asObservable();
    public channelNameSubject = new BehaviorSubject<string>('');
    currentChannelName$ = this.channelNameSubject.asObservable();
    private channelDescriptionSubject = new BehaviorSubject<string>('');
    currentChannelDescription$ = this.channelDescriptionSubject.asObservable();
    private channelCreatorSubject = new BehaviorSubject<string>('');
    currentChannelCreator$ = this.channelCreatorSubject.asObservable();
    private channelIdSubject = new BehaviorSubject<string>('');
    private channelMemberSubject = new BehaviorSubject<Member[]>([]);
    channelMember$ = this.channelMemberSubject.asObservable();
    currentChannelId$ = this.channelIdSubject.asObservable();
    private channelDateSubject = new BehaviorSubject<string>('');
    currentChannelDate$ = this.channelDateSubject.asObservable();


    constructor(private route: ActivatedRoute, private registerservice: RegisterService, private mainservice: MainComponentService) {
        this.unsubChannel = this.subChannelList()
        this.mainservice.saveActualUser()
        this.mainservice.acutalUser$.subscribe(actualuser => {
            this.actualUser = actualuser;

        });
     
    }

    subChannelList() {
        return onSnapshot(this.getChannelRef(), (channel) => {
            let channelssArray: Channel[] = [];
            channel.forEach(element => {
                channelssArray.push(this.setChannelObject(element.data(), element.id,))
                console.log('Daten in Firebase', element.data())
            })
            this.allChannels = channelssArray
            this.channelsSubject.next(channelssArray);
            console.log(this.allChannels)

        })
    }



    async updateUserNameInChannels(nameInput: string, nameBefore: string) {
        try {

            for (let i = 0; i < this.allChannels.length; i++) {
                let channel = this.allChannels[i];


                if (channel.creator === nameBefore) {
                    const channelDocRef = doc(this.firestore, 'Channels', channel.id);
                    channel.creator = nameInput;
                    await updateDoc(channelDocRef, {
                        creator: nameInput,
                    });

                } else {

                }
                this.updateMemberInChannels(channel, nameInput, nameBefore)


            }

        } catch (error) {

        }
    }


    async updateMemberInChannels(channel: any, nameInput: string, nameBefore: string) {
        let updated = false;

        for (let i = 0; i < channel.members.length; i++) {
            const member = channel.members[i];

            // Name prüfen
            if (member.name === nameBefore) {
                channel.members[i].name = nameInput;
                updated = true;
            }
        }

        if (updated) {
            const channelDocRef = doc(this.firestore, 'Channels', channel.id);
            await updateDoc(channelDocRef, {
                members: channel.members,
            });
        }
        await this.subChannelList();
        setTimeout(() => {
            this.channelMemberSubject.next(channel.members);
        }, 1000);
    }

setCurrentChannel(channelId: string) {
  const channelDocRef = doc(this.firestore, 'Channels', channelId);

  getDoc(channelDocRef).then((docSnap) => {
    if (docSnap.exists()) {
      const channel = docSnap.data() as Channel;
      this.channelNameSubject.next(channel.name);
      this.channelDescriptionSubject.next(channel.description);
      this.channelCreatorSubject.next(channel.creator);
      this.channelDateSubject.next(channel.date);
      this.channelIdSubject.next(channelId);
      this.channelMemberSubject.next(channel.members);
    } else {
      console.warn('⚠️ Channel nicht gefunden:', channelId);
    }
  }).catch(error => {
    console.error('❌ Fehler beim Laden des Channels:', error);
  });
}


    setChannelName(name: string): void {
        this.channelNameSubject.next(name);
    }

    setChannelDescription(description: string): void {
        this.channelDescriptionSubject.next(description)
    }

    setChannelMember(members: Member[]): void {
        this.channelMemberSubject.next(members)
        console.log('this.channelMemberSubject', this.channelMemberSubject);

    }

    setChannelcreator(creator: string): void {
        this.channelCreatorSubject.next(creator)
    }

    setChannelId(id: string): void {
        this.channelIdSubject.next(id)
    }

    setChanneldate(date: string): void {
        this.channelDateSubject.next(date)
    }

    ngonDestroy() {

        this.unsubChannel();
    }

    async addChannel(item: Channel) {
  const timestamp = new Date().toISOString();

  return addDoc(this.getChannelRef(), this.channelJson(item, this.actualUser[0].name, timestamp))
    .then(async docref => {
      this.id = docref.id;

      // Channel-Dokument mit ID aktualisieren
      await updateDoc(docref, { id: docref.id });

      // Jetzt die Subcollection "messages" erstellen (mit einer ersten Nachricht)
      return docref;
    });
}

async addsubcolecctiontoChannel(docref:string){
 const messagesRef = collection(this.firestore, `Channels/${docref}/messages`);
      await addDoc(messagesRef, {
        text: 'Willkommen im Channel!',
        createdAt: new Date(),
        system: true,
        sender: 'System'
      });

     
}



    async updateChannel(channelId: string, name: string, description: string) {
        const channelDocRef = doc(this.firestore, 'Channels', channelId);

        await updateDoc(channelDocRef, {
            name: name,
            description: description
        });
        console.log('✅ Mitglieder wurden zum Channel hinzugefügt');
    }

    async deleteChannel(channelId: string) {
        const channelDocRef = doc(this.firestore, 'Channels', channelId);
        await deleteDoc(channelDocRef)
    }


    setChannelObject(obj: any, id: string): Channel {
        return {
            id: id,
            name: obj.name,
            members: obj.members,
            creator: obj.creator,
            description: obj.description,
            date: obj.date
        };
    }

    getChannelRef() {
        return collection(this.firestore, 'Channels');
    }

    channelJson(item: Channel, creator: string, date: string) {
        return {
            id: item.id,
            name: item.name,
            members: [] as Member[],
            creator: creator,
            description: item.description,
            date: date

        }
    }

    async addMembersToChannel(channelId: string, members: { id: string, name: string, avatar: number }[]) {
        const channelDocRef = doc(this.firestore, 'Channels', channelId);
        await updateDoc(channelDocRef, {
            members: members
        });
        console.log('✅ Mitglieder wurden zum Channel hinzugefügt');
    }

    async updateNewMembersInFirebase(userList: any[], currentChannelID: string) {
        try {

            const channel = this.allChannels.find(c => c.id === currentChannelID);
            if (channel) {
                channel.members = channel.members.filter(member =>
                    userList.some(user => user.id === member.id)
                );
                const channelDocRef = doc(this.firestore, 'Channels', currentChannelID);
                await updateDoc(channelDocRef, { members: channel.members });

                for (let index = 0; index < userList.length; index++) {
                    const user = userList[index];
                    const newUser = this.filterUser(user);
                    const alreadyMember = channel.members.some(m => m.id === newUser.id);

                    if (!alreadyMember) {
                        channel.members.push(newUser);
                        await updateDoc(channelDocRef, { members: channel.members });
                    }
                }

            }
            this.channelMemberSubject.next(userList)
        } catch (error) {
            console.error('Error updating members in Firestore:', error);
        }
    }





    filterUser(user: Member) {
        return {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            status: user.status
        }
    }



}
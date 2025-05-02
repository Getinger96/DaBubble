import { Injectable, inject } from '@angular/core';
import { addDoc, collection, doc, Firestore, onSnapshot, updateDoc, DocumentReference,deleteDoc } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Channel } from '../interfaces/channel.interface';
import { BehaviorSubject } from 'rxjs';
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
    private channelNameSubject = new BehaviorSubject<string>('');
    currentChannelName$ = this.channelNameSubject.asObservable();
    private channelDescriptionSubject = new BehaviorSubject<string>('');
    currentChannelDescription$ = this.channelDescriptionSubject.asObservable();
    private channelCreatorSubject = new BehaviorSubject<string>('');
    currentChannelCreator$ = this.channelCreatorSubject.asObservable();
    private channelIdSubject = new BehaviorSubject<string>('');
    private channelMemberSubject = new BehaviorSubject<Member[]>([]);
    channelMember$ = this.channelMemberSubject.asObservable();
    currentChannelId$ = this.channelIdSubject.asObservable()


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
                channelssArray.push(this.setChannelObject(element.data(), element.id))
                console.log('Daten in Firebase', element.data())
            })
            this.allChannels = channelssArray
            this.channelsSubject.next(channelssArray);
            console.log(this.allChannels)

        })
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

    ngonDestroy() {

        this.unsubChannel();
    }

    async addChannel(item: Channel) {
        return addDoc(this.getChannelRef(), this.channelJson(item, this.actualUser[0].name)).then(async docref => {
            this.id = docref.id

            await updateDoc(docref, { id: docref.id });
            return docref;
        })
    }


    async updateChannel(channelId: string, name: string, description: string) {
        const channelDocRef = doc(this.firestore, 'Channels', channelId);

        await updateDoc(channelDocRef, {
            name: name,
            description: description
        });
        console.log('✅ Mitglieder wurden zum Channel hinzugefügt');
    }

    async deleteChannel(channelId:string){
        const channelDocRef=doc(this.firestore,'Channels',channelId);
        await deleteDoc(channelDocRef)
    }


    setChannelObject(obj: any, id: string): Channel {
        return {
            id: id,
            name: obj.name,
            members: obj.members,
            creator: obj.creator,
            description: obj.description
        };
    }

    getChannelRef() {
        return collection(this.firestore, 'Channels');
    }

    channelJson(item: Channel, creator: string) {
        return {
            id: item.id,
            name: item.name,
            members: [] as Member[],
            creator: creator,
            description: item.description

        }
    }

    async addMembersToChannel(channelId: string, members: { id: string, name: string, avatar: number }[]) {
        const channelDocRef = doc(this.firestore, 'Channels', channelId);
        await updateDoc(channelDocRef, {
            members: members
        });
        console.log('✅ Mitglieder wurden zum Channel hinzugefügt');
    }


    
   async updateNewMembersInFirebase(user:any, currentChannelID:string) {
        const channel = this.allChannels.find(allChannels => allChannels.id === currentChannelID);
        console.log('channel', channel, user);

        if (channel) {
        const newUser = this.filterUser(user);
        channel?.members.push(newUser)
        const channelDocRef = doc(this.firestore, 'Channels', currentChannelID);
        await updateDoc(channelDocRef, {
            members: channel.members
          });
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
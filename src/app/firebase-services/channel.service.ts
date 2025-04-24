import { Injectable, inject } from '@angular/core';
import { addDoc, collection, doc, Firestore, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Channel } from '../interfaces/channel.interface';
import { BehaviorSubject } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { RegisterService } from './register.service';
import { MainComponentService } from './main-component.service';



@Injectable({
    providedIn: 'root'
})

export class ChannelService {
    firestore: Firestore = inject(Firestore);
    unsubChannel;
    allChannels: Channel[] = [];
    actualUser: User[] = [];
    private channelsSubject = new BehaviorSubject<Channel[]>([]);
    public channels$ = this.channelsSubject.asObservable();


    constructor(private route: ActivatedRoute, private registerservice: RegisterService,private mainservice:MainComponentService) {
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

    ngonDestroy() {

        this.unsubChannel();
    }

    addChannel(item: Channel, event: Event) {
        return addDoc(this.getChannelRef(), this.channelJson(item, this.actualUser[0].name))
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
            members: [],
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
    
}
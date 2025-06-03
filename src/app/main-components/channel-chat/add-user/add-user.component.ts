import { Component, Input , Inject, OnInit } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import { User } from '../../../interfaces/user.interface';
import { NgIf, CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { Member } from '../../../interfaces/member.interface';
import {ChannelService } from '../../../firebase-services/channel.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [MatCardModule, CommonModule, FormsModule],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss'
})
export class AddUserComponent implements OnInit {
  newUserList: User[] = [];
  searchUser:string =''
  originalUserList: User[] = [];
  memberList: Member[] =[]
  filterUserList:User[]=[]
  constructor( private channelService: ChannelService,  public dialogRef: MatDialogRef<AddUserComponent>, @Inject(MAT_DIALOG_DATA) public data: { allUsers: User[], members: Member[],currentChannelID: string, currentChannelName:string   }) {
 
  }

  closeDialog() {
    this.dialogRef.close();
  }


  ngOnInit(): void {
    this.filterNewUser();
    this.filterMember();
    this.originalUserList = [...this.newUserList];
    
  }

  addNewUser(user: any) {
    console.log('user.id',user.id);
    console.log('this.data.allUsersChannel', this.data.allUsers);
    
    const index = this.newUserList.findIndex(u => u.id === user.id);
    if (index !== -1) {
      this.newUserList.splice(index, 1);
      console.log();
      
    }
    console.log('this.data.allUsersChannel', this.data.allUsers);
    this.memberList.push(user)
    console.log('this.data.members', this.data.members);
    console.log('this.data.members', this.data.members);
  }


  filterNewUser() {

    for (let index = 0; index < this.data.allUsers.length; index++) {
      const user = this.data.allUsers[index];
      console.log('user, ', user);
      const newUser = this.data.members.some(members => members.id === this.data.allUsers[index].id )
      if (!newUser) {
        this.newUserList.push(this.data.allUsers[index])
        console.log('newArray, ', this.newUserList);
        
      }
    }
    console.log('newArray, ', this.newUserList);
  }

  async deleteUser(index: number, member:any) {
    this.memberList.splice(index, 1);
    this.newUserList.push(member)
   await this.channelService.updateNewMembersInFirebase(this.memberList, this.data.currentChannelID);
    this.filterNewUser();
  }



  async addNewUserInFirebase() {
   await this.channelService.updateNewMembersInFirebase(this.memberList, this.data.currentChannelID);
   this.filterNewUser();
   this.filterMember();
   this.dialogRef.close(true); 
  }


  filterMember() {
    this.memberList = [...this.data.members];
      console.log('this.memberList', this.memberList);
      
  }

  filterUsers() {
  const term = this.searchUser.toLowerCase();
    console.log('this.searchUser.toLocaleLowerCase();',this.searchUser.toLocaleLowerCase());

    if (term.length >= 2 ) {
        this.filterUserList = this.newUserList.filter(user => user.name.toLowerCase().includes(term))
      this.filterUserList.sort((a, b) => a.name.localeCompare(b.name));
        console.log('this.filterUserList', this.filterUserList);
      
    }


      
 
    }
    
  }

 // searchUserInUserList() {
   //  const term = this.searchUser.toLowerCase();
  //   if (term.length ===0) {
  //     this.newUserList = [...this.originalUserList];
      
   //  } else  {
  //     this.newUserList = this.originalUserList.filter(user =>
   //      user.name.toLowerCase().includes(term)
     //  )
  // }
 //}


import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FormsModule } from '@angular/forms';
import { User } from '../interfaces/user.interface';
import { RegisterService } from '../firebase-services/register.service';



@Component({
  selector: 'app-register',
  standalone: true,
  imports: [MatInputModule,CommonModule,MatCardModule,MatIconModule,MatButtonModule,RouterModule,HeaderComponent,FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
borderVisibleName:boolean=false;
borderVisibleMail:boolean=false;
borderVisiblepasswort:boolean=false;
user:User = new User()


constructor(private registerservice: RegisterService){

}

divfocusName(field: string, isFocused: boolean){
  this.borderVisibleName=isFocused
}

divfocusmail(field: string, isFocused: boolean){
  this.borderVisibleMail=isFocused
}


divfocusPasswort(field: string, isFocused: boolean){
  this.borderVisiblepasswort=isFocused
}

addUser(){
  
  this.registerservice.addNewUser(this.registerservice.setUserObject(this.user))
}



}

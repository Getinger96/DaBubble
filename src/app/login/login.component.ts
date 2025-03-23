import { Component } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from "../header/header.component";
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { User } from '../interfaces/user.interface';
import { RegisterService } from '../firebase-services/register.service';
import { GoogleAuthProvider } from "firebase/auth";
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatButtonModule, RouterModule, HeaderComponent,MatInputModule,MatIconModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  isActiveEmail: boolean = false;
  isActivePassword: boolean = false;
  isHovered: boolean = false;
 
  constructor(private registerservice: RegisterService){

  }





  setFocusEmail(field: string, isFocused: boolean) {
    this.isActiveEmail = isFocused;

  }

  setFocusPassword(field: string, isFocused: boolean) {
    this.isActivePassword = isFocused;

  }

  setFocusLoginWithGoogle(field: string, isFocused: boolean) {
    this.isActivePassword = isFocused;

  }

  hoverBtn(state: boolean) {
    this.isHovered = state;
  }

  async login(event: Event){
     
    this.registerservice.loginWithGoogle(event)
    
  }
  
}

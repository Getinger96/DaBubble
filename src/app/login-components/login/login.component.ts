import { Component, ViewChild, ElementRef } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared-components/header/header.component';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { User } from '../../interfaces/user.interface';
import { RegisterService } from '../../firebase-services/register.service';
import { GoogleAuthProvider } from "firebase/auth";
import { FormsModule, NgForm } from '@angular/forms';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatButtonModule, RouterModule, HeaderComponent,MatInputModule,MatIconModule, CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  isActiveEmail: boolean = false;
  isActivePassword: boolean = false;
  isHovered: boolean = false;
  emailFielIsEmpty: boolean = true
  passwordFieldIsEmpty: boolean = true
  user: User = new User();
  @ViewChild('email') emailInput!: ElementRef;
  @ViewChild('password') passwordInput!: ElementRef;
  loginEmailIsCorrect : boolean = true;
  loginEmailAndPasswordAreCorrect : boolean = true;
  passWordLengthIsCorrect: boolean = true
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
  async loginAccount(email: string, password: string, event: Event) {
      await this.registerservice.loginUser(email, password, event);
      this.checkEmail();
      this.checkpasswordInput();
      this.checkEmailAndPassword();
   
  }
  
  checkpasswordInput() {
    if (this.passwordInput.nativeElement.value.length > 6) {
      this.passWordLengthIsCorrect = true;
      return true;  
    } else {
      this.passWordLengthIsCorrect = false;
      return false; 
    }
  }
  
  checkEmail() {
    if (this.registerservice.loginIsEmailValide) {
      this.loginEmailIsCorrect = true;
    } else {
      this.loginEmailIsCorrect = false;
    }
  }
  
  checkEmailAndPassword() {
    if (this.registerservice.loginIsValide) {
      this.loginEmailAndPasswordAreCorrect = true;
    } else {
      this.loginEmailAndPasswordAreCorrect = false;
    }
  }
  
  


  inputFieldEmailIsEmpty() {
  if (this.emailInput.nativeElement.value.length == 0) {
    this.emailFielIsEmpty = false;
    console.log('klappt Email');
  } else {
    this.emailFielIsEmpty = true;
  }
  
}


inputFieldPasswordIsEmpty() {
  if (this.passwordInput.nativeElement.value.length == 0 ) {
    this.passwordFieldIsEmpty = false;
    console.log('klappt Password');
    
  } else {
    this.passwordFieldIsEmpty = true;
  }
  
}


}

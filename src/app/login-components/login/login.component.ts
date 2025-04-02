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
import { Router } from '@angular/router';
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
  overlayvisible: boolean = false;
  constructor(private registerservice: RegisterService, private router: Router){

  }


  showAnimationLogin() {
    this.overlayvisible=true;
    setTimeout(() => {
     this.overlayvisible=false
     this.router.navigate(['/main-components']);
    }, 2000)
  }


  guestLogin(event: Event) {
    event.preventDefault()
    this.overlayvisible=true;
    setTimeout(() => {
     this.overlayvisible=false
     this.router.navigate(['/main-components']);
    }, 2000)

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
  async loginAccount(email: string, password: string, event: Event){
    if (!this.inputFieldEmailIsEmpty()) { return;}
    if (this.checkTheInputFields()) {return;}
      await this.registerservice.loginUser(email, password, event);
      
      if (!this.checkEmail()) {return;}
      if (!this.checkpasswordInput()) {return;}
      if (!this.checkEmailAndPassword()) {return;}

      this.showAnimationLogin();
  }


  checkTheInputFields() {
    if (this.emailInput.nativeElement.value.length == 0 && this.passwordInput.nativeElement.value.length == 0  ) {
      this.emailFielIsEmpty = false;
      this.passwordFieldIsEmpty = false;
      return true;
    } else {
      return false; 
    }
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
      return true;
    } else {
      this.loginEmailIsCorrect = false;
      return false; 
    }
  }
  
  checkEmailAndPassword() {
    if (this.registerservice.loginIsValide) {
      this.loginEmailAndPasswordAreCorrect = true;
      return true;
    } else {
      this.loginEmailAndPasswordAreCorrect = false;
      return false; 
    }
  }
  
  


  inputFieldEmailIsEmpty() {
  if (this.emailInput.nativeElement.value.length == 0) {
    this.emailFielIsEmpty = false;
    console.log('klappt Email');
    return false;
  } else {
    this.emailFielIsEmpty = true;
    return true;
  }
  
}


inputFieldPasswordIsEmpty() {
  if (this.passwordInput.nativeElement.value.length == 0 ) {
    this.passwordFieldIsEmpty = false;
    this.checkpasswordInput();
    console.log('klappt Password');
    
  } else {
    this.passwordFieldIsEmpty = true;
  }
  
}


}

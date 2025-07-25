import { Component, ViewChild, ElementRef, OnInit, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { User } from '../../interfaces/user.interface';
import { RegisterService } from '../../firebase-services/register.service';
import { AuthService } from '../../firebase-services/auth.service';
import { GoogleAuthProvider } from "firebase/auth";
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { IntroComponent } from '../intro/intro.component';
import { HeaderLogoComponent } from '../header-logo/header-logo.component';
import { MainComponentService } from '../../firebase-services/main-component.service';
import { LoginService } from '../../firebase-services/login.service';
import { first, firstValueFrom, Subscription } from 'rxjs';
import { MainHelperService } from '../../services/main-helper.service';
import { FinalLogoComponent } from '../final-logo/final-logo.component';
import { HeaderComponent } from "../../shared-components/header/header.component";
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatButtonModule, RouterModule, MatInputModule, MatIconModule, CommonModule, FormsModule, IntroComponent, HeaderLogoComponent, FinalLogoComponent, HeaderComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  isActiveEmail: boolean = false;
  isActivePassword: boolean = false;
  isHovered: boolean = false;
  emailFielIsEmpty: boolean = true
  passwordFieldIsEmpty: boolean = true
  user: User = new User();
  userId?: string
  private actualUserSubscription!: Subscription;
  @ViewChild('email') emailInput!: ElementRef;
  @ViewChild('password') passwordInput!: ElementRef;
  loginEmailIsCorrect: boolean = true;
  loginEmailAndPasswordAreCorrect: boolean = true;
  passWordLengthIsCorrect: boolean = true
  overlayvisible: boolean = this.loginservice.overlayvisible
  introView: boolean = true;
  logoView: boolean = false;
  actualUser: any;
  introAlreadyPlayed = false;
  constructor(private registerservice: RegisterService, private authService: AuthService, private router: Router, private cdRef: ChangeDetectorRef, private ngZone: NgZone,
    private mainservice: MainComponentService, private loginservice: LoginService, private mainHelperService : MainHelperService) {
      if (this.loginservice.loginoverlay==false) {
        this.overlayvisible=false;
      }
  }

 ngOnInit(): void {
    this.introAlreadyPlayed = !!localStorage.getItem('introAnimationCompleted');
  }
  
      
  

  async showAnimationLogin() {
  try {
    const actualUser = await firstValueFrom(this.mainservice.acutalUser$.pipe(first(user => user.length > 0)));
    this.actualUser = actualUser;
    this.userId = this.actualUser[0].id;
    this.overlayvisible = true;

    await new Promise(resolve => setTimeout(resolve, 2000));

    this.overlayvisible = false;
    this.router.navigate(['/main-components/' + this.userId + '/channel/BLDNqmQQWm4Qqv4NLNbv'], { replaceUrl: true });
  } catch (error) {
    console.error('Fehler beim Laden des Users:', error);
  }
}

  async guestLogin(event: Event) {
    event.preventDefault();
    this.user.passwort = 'Gast123'
    this.user.email = 'guest@gmail.com'
    this.passwordInput.nativeElement.value = '';
    await this.loginservice.loginUser(this.user.email, this.user.passwort, event);
    this.showAnimationLogin();
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

  async login(event: Event) {
    await this.authService.loginWithGoogle(event)
    
    this.showAnimationLogin();
  }




  async loginAccount(email: string, password: string, event: Event) {
  if (!this.inputFieldEmailIsEmpty()) { return; }
  if (this.checkTheInputFields()) { return; }
  await this.loginservice.loginUser(email, password, event);
  if (!this.checkEmail()) { return; }
  if (!this.checkpasswordInput()) { return; }
  if (!this.checkEmailAndPassword()) { return; }
  this.showAnimationLogin();
}

checkTheInputFields() {
  if (this.emailInput.nativeElement.value.length == 0 && this.passwordInput.nativeElement.value.length == 0) {
    this.emailFielIsEmpty = false;
    this.passwordFieldIsEmpty = false;
    return true;
  } else {
    return false;
  }
}

checkpasswordInput() {
  if (this.passwordInput.nativeElement.value.length >= 6) {
    this.passWordLengthIsCorrect = true;
    return true;
  } else {
    this.passWordLengthIsCorrect = false;
    return false;
  }
}

checkEmail() {
  if (this.loginservice.loginIsEmailValide) {
    this.loginEmailIsCorrect = true;
    return true;
  } else {
    this.loginEmailIsCorrect = false;
    return false;
  }
}

checkEmailAndPassword() {
  if (this.loginservice.loginIsValide) {
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
    return false;
  } else {
    this.emailFielIsEmpty = true;
    return true;
  }
}

inputFieldPasswordIsEmpty() {
  if (this.passwordInput.nativeElement.value.length == 0) {
    this.passwordFieldIsEmpty = false;
    this.checkpasswordInput();

  } else {
    this.passwordFieldIsEmpty = true;
  }
}

}

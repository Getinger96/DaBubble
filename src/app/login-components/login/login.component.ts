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
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatButtonModule, RouterModule, MatInputModule, MatIconModule, CommonModule, FormsModule, IntroComponent, HeaderLogoComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements AfterViewInit {

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

  constructor(private registerservice: RegisterService, private authService: AuthService, private router: Router, private cdRef: ChangeDetectorRef, private ngZone: NgZone,
    private mainservice: MainComponentService, private loginservice: LoginService) {
  }

  ngAfterViewInit(): void {
    let animationCompleted = localStorage.getItem('introAnimationCompleted');

    if (!animationCompleted) {
      setTimeout(() => {
        this.introView = false;
        this.logoView = true;
        localStorage.setItem('introAnimationCompleted', 'true');
      }, 2000);
    } else {
      this.introView = false;
      this.logoView = true;
      this.cdRef.detectChanges()// Sag Angular: Prüf das nochmal im DOM
    }
  }

  showAnimationLogin() {
    this.actualUserSubscription = this.mainservice.acutalUser$.subscribe(actualUser => {
      if (actualUser.length > 0) {
        this.actualUser = actualUser;
      }
    });
    this.userId = this.actualUser[0].id;
    this.overlayvisible = true;
    setTimeout(() => {
      this.overlayvisible = false
      this.router.navigate([`/main-components/${this.userId}`]);
    }, 2000)
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
    if (this.passwordInput.nativeElement.value.length > 6) {
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
      console.log('klappt Email');
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
      console.log('klappt Password');

    } else {
      this.passwordFieldIsEmpty = true;
    }
  }
}

import { Component } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from "../header/header.component";
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import { CommonModule } from '@angular/common';
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

}

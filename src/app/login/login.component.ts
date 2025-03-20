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
  mailFieldIsActive: boolean = false;
  emailIconIsActive: boolean = false;



  onInputEmailClick() {
    this.mailFieldIsActive = true
    this.emailIconIsActive =  true
  }


  onInputEmailBlur() {
    this.mailFieldIsActive = false
    this.emailIconIsActive =  false
  }
}

import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FormsModule, NgForm } from '@angular/forms';
import { User } from '../interfaces/user.interface';
import { RegisterService } from '../firebase-services/register.service';
@Component({
  selector: 'app-passwort-reset',
  standalone: true,
  imports: [MatInputModule, CommonModule, MatCardModule, MatIconModule, MatButtonModule, RouterModule, HeaderComponent, FormsModule],
  templateUrl: './passwort-reset.component.html',
  styleUrl: './passwort-reset.component.scss'
})
export class PasswortResetComponent {
  borderVisiblepasswort: boolean = false;
  borderVisiblepasswortNew: boolean= false;
  newPasswort:string=''
  confirmedPasswort:string=''
  length: any='';
 

  divfocusPasswort(field: string, isFocused: boolean) {
    this.borderVisiblepasswort = isFocused
  }
  divfocusPasswortNew(field: string, isFocused: boolean) {
    this.borderVisiblepasswortNew = isFocused
  }
}

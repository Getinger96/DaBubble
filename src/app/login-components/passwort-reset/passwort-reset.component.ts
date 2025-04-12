import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared-components/header/header.component';
import { FormsModule, NgForm } from '@angular/forms';
import { User } from '../../interfaces/user.interface';
import { RegisterService } from '../../firebase-services/register.service';
import { getAuth, confirmPasswordReset } from 'firebase/auth';
import { HeaderLogoComponent } from "../header-logo/header-logo.component";

@Component({
  selector: 'app-passwort-reset',
  standalone: true,
  imports: [MatInputModule, CommonModule, MatCardModule, MatIconModule, MatButtonModule, RouterModule, FormsModule, HeaderComponent, HeaderLogoComponent],
  templateUrl: './passwort-reset.component.html',
  styleUrl: './passwort-reset.component.scss'
})
export class PasswortResetComponent {
  borderVisiblepasswort: boolean = false;
  borderVisiblepasswortNew: boolean= false;
  newPasswort:string=''
  confirmedPasswort:string=''
  length: any='';
  oobCode: string | null = null;
  overlayvisible:boolean=false;
 

  
    constructor(private registerservice: RegisterService){

    }
    
  
 
  

  divfocusPasswort(field: string, isFocused: boolean) {
    this.borderVisiblepasswort = isFocused
  }
  divfocusPasswortNew(field: string, isFocused: boolean) {
    this.borderVisiblepasswortNew = isFocused
  }


  resetPassword(newPasswort: any,confirmedPasswort: any){
    this.registerservice.resetPassword(newPasswort,confirmedPasswort)
    this.overlayvisible=true;
    setTimeout(() => {
     this.overlayvisible=false
    }, 2000);

  }
}

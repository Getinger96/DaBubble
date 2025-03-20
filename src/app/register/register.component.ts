import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';



@Component({
  selector: 'app-register',
  standalone: true,
  imports: [MatInputModule,CommonModule,MatCardModule,MatIconModule,MatButtonModule,RouterModule,HeaderComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
borderVisibleName:boolean=false;
borderVisibleMail:boolean=false;
borderVisiblepasswort:boolean=false;
divfocusName(){
  this.borderVisibleName=true
}

divfocusmail(){
  this.borderVisibleMail=true
}


divfocusPasswort(){
  this.borderVisiblepasswort=true
}
}

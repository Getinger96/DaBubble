import { Component } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from "../header/header.component";
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatButtonModule, RouterModule, HeaderComponent,MatInputModule,MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

}

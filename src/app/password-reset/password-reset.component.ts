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
  selector: 'app-password-reset',
  standalone: true,
  imports: [MatInputModule, CommonModule, MatCardModule, MatIconModule, MatButtonModule, RouterModule, HeaderComponent, FormsModule],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.scss'
})
export class PasswordResetComponent {
  borderVisibleMail: boolean = false;
  user: User = new User();

  divfocusmail(field: string, isFocused: boolean) {
    this.borderVisibleMail = isFocused
  }
}

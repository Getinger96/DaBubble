import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared-components/header/header.component';
import { FormsModule, NgForm } from '@angular/forms';
import { User } from '../../interfaces/user.interface';
import { RegisterService } from '../../firebase-services/register.service';
import { HeaderLogoComponent } from "../header-logo/header-logo.component";




@Component({
  selector: 'app-register',
  standalone: true,
  imports: [MatInputModule, CommonModule, MatCardModule, MatIconModule, MatButtonModule, RouterModule, HeaderComponent, FormsModule, HeaderLogoComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  borderVisibleName: boolean = false;
  borderVisibleMail: boolean = false;
  borderVisiblepasswort: boolean = false;
  user: User = new User();
  isChecked: boolean = false;
  overlayvisible: boolean = false;
  userAlreadyExist?: boolean = this.registerservice.userEmailExist
  userNameAlreadyExist?: boolean = this.registerservice.userEmailExist

  constructor(private registerservice: RegisterService) {

  }

  divfocusName(field: string, isFocused: boolean) {
    this.borderVisibleName = isFocused
  }

  divfocusmail(field: string, isFocused: boolean) {
    this.borderVisibleMail = isFocused
  }

  divfocusPasswort(field: string, isFocused: boolean) {
    this.borderVisiblepasswort = isFocused
  }

  async addUser(event: Event, ngForm: NgForm): Promise<void> {
    try {
      const success = await this.registerservice.addNewUser(
        this.registerservice.setUserObject(this.user, this.user.id),
        event
      );
      this.userAlreadyExist = this.registerservice.userEmailExist
      this.userNameAlreadyExist=this.registerservice.userNameExist

      if (success) {
        this.overlayvisible = true;

        setTimeout(() => {
          this.overlayvisible = false;
        }, 2000);
      }
    } catch (error) {
      console.error("Fehler beim Hinzufügen des Benutzers:", error);
    }
  }
}

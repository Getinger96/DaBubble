import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { RegisterService } from '../../firebase-services/register.service';
import { Subscription } from 'rxjs';
import { User } from '../../interfaces/user.interface';
@Component({
  selector: 'app-user-card-menu',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './user-card-menu.component.html',
  styleUrl: './user-card-menu.component.scss'
})
export class UserCardMenuComponent {

  constructor(private route: ActivatedRoute, public registerService: RegisterService) { }

  avatar?:number;
  name?:string;
  email?:string;
  private usersSubscription!: Subscription;
  actualUser: User[] = [];
  userId?: string;


  ngOnInit() {
    // 1. Benutzer aus dem Service holen
    this.usersSubscription = this.registerService.allUsers$.subscribe(users => {
      this.actualUser = users;
      console.log('Benutzer in der Komponente:', this.actualUser);
    });

    // 2. ID aus der Route holen
    this.route.paramMap.subscribe(params => {
      this.userId = params.get('id') || ''; // ID aus der URL holen
      console.log('ID aus der URL:', this.userId);

      // Beispiel: passenden Benutzer raussuchen
      if (this.userId && this.actualUser.length > 0) {
        const user = this.actualUser.find(u => u.id === this.userId);
        if (user) {
          this.name = user.name;
          this.email = user.email;
          this.avatar = user.avatar;
        }
      }
    });
  }


}
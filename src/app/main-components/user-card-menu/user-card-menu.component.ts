import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { RegisterService } from '../../firebase-services/register.service';

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



  ngOnInit() {
    const id$ = this.route.url.subscribe(params => {
      let id = (params[1].path);
      this.registerService.getActualUser(id);
    });

    console.log(this.registerService.actualUser);
  }

}

import { Injectable } from '@angular/core';
import { RegisterService } from '../../../firebase-services/register.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MainComponentService } from '../../../firebase-services/main-component.service';
import { LoginService } from '../../../firebase-services/login.service';

@Injectable({
  providedIn: 'root'
})
export class UserCardService {
  overlayUserCardActive: boolean = false;


  constructor(
    private registerservice: RegisterService,
    private route: ActivatedRoute,
    private router: Router,
    private mainservice:MainComponentService,
    private loginservice:LoginService) {
      
    }
    
}

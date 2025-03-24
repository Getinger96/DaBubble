import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { IntroComponent } from './intro/intro.component';

export const routes: Routes = [
    
    { path: '', component: IntroComponent },
    {path: 'login', component:LoginComponent },
    {path: 'signUp', component:RegisterComponent },
];


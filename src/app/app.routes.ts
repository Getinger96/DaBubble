import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { IntroComponent } from './intro/intro.component';
import { PasswordResetEmailComponent } from './password-reset-email/password-reset-email.component';
import { PasswortResetComponent } from './passwort-reset/passwort-reset.component';

export const routes: Routes = [
    
    { path: '', component: IntroComponent },
    {path: 'login', component:LoginComponent },
    {path: 'signUp', component:RegisterComponent },
    {path: 'resetEmail', component:PasswordResetEmailComponent },
    {path: 'reset', component: PasswortResetComponent },
];


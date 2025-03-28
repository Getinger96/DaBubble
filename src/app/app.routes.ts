import { Routes } from '@angular/router';
import { LoginComponent } from './login-components/login/login.component';
import { RegisterComponent } from './login-components/register/register.component';
import { IntroComponent } from './login-components/intro/intro.component';
import { PasswordResetEmailComponent } from './login-components/password-reset-email/password-reset-email.component';
import { PasswortResetComponent } from './login-components/passwort-reset/passwort-reset.component';
import { ChooseAvatarComponent } from './login-components/choose-avatar/choose-avatar.component';
import { MainComponentsComponent } from './main-components/main-components.component';

export const routes: Routes = [
    
    { path: 'chooseAvatar', component: ChooseAvatarComponent},
    { path: '', component: IntroComponent },
    {path: 'login', component:LoginComponent },
    {path: 'signUp', component:RegisterComponent },
    {path: 'resetEmail', component:PasswordResetEmailComponent },
    {path: 'reset', component: PasswortResetComponent },
    {path: 'main-components', component: MainComponentsComponent},
];


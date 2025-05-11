import { Routes } from '@angular/router';
import { LoginComponent } from './login-components/login/login.component';
import { RegisterComponent } from './login-components/register/register.component';
import { IntroComponent } from './login-components/intro/intro.component';
import { PasswordResetEmailComponent } from './login-components/password-reset-email/password-reset-email.component';
import { PasswortResetComponent } from './login-components/passwort-reset/passwort-reset.component';
import { ChooseAvatarComponent } from './login-components/choose-avatar/choose-avatar.component';
import { MainComponentsComponent } from './main-components/main-components.component';
import { ChannelChatComponent } from './main-components/channel-chat/channel-chat.component';
import { ImprintComponent } from './imprint/imprint.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'signUp', component: RegisterComponent },
  { path: 'intro', component: IntroComponent },
  { path: 'chooseAvatar', component: ChooseAvatarComponent },
  { path: 'resetEmail', component: PasswordResetEmailComponent },
  { path: 'reset', component: PasswortResetComponent },
  {
    path: 'main-components/:id',
    component: MainComponentsComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'channel/:channelId',
        component: ChannelChatComponent,
      }
    ]
  },
  { path: 'imprint', component: ImprintComponent },
  { path: 'privacy', component: PrivacyComponent },
];

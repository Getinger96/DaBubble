import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LoginService } from '../firebase-services/login.service';

export const authGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);
console.log('Guard checked. Login valid?', loginService.loginIsValide);
  if (loginService.loginIsValide) {
    return true;
  } else {
    router.navigate(['/']); // root == LoginComponent
    return false;
  }
};


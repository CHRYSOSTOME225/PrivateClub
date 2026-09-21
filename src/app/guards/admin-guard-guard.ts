import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';


export const adminGuard: CanActivateFn = () => {

  const auth = inject(Auth);
  const router = inject(Router);


  if (
    auth.estConnecte() &&
    auth.getRole() === 'Admin'
  ) {

    return true;

  }


  router.navigate(['/dashboard']);

  return false;

};
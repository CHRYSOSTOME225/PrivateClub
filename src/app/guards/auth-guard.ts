import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';


export const authGuard: CanActivateFn = () => {

  const auth = inject(Auth);
  const router = inject(Router);


  if (auth.estConnecte()) {

    return true;

  }


  router.navigate(['/']);

  return false;

};
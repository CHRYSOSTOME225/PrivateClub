import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Auth } from './services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const auth = inject(Auth);
  const router = inject(Router);

  const token = localStorage.getItem('token');

  let requete = req;

  if (token) {

    requete = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

  }

  return next(requete).pipe(

    catchError((erreur) => {

      if (erreur.status === 401) {

        console.log(
          'Session expirée ou token invalide'
        );

        auth.deconnecter();

        router.navigate(['/']);

      }

      return throwError(() => erreur);

    })

  );

};
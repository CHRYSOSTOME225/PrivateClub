
import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { Auth } from '../../services/auth';


@Component({
  selector: 'app-connexion',
  imports: [FormsModule],
  templateUrl: './connexion.html',
  styleUrl: './connexion.css'
})
export class Connexion {

  email = '';

  motDePasse = '';

  message = '';


  constructor(
    private router: Router,
    private auth: Auth
  ) {}


  // ===============================
  // SE CONNECTER
  // ===============================

  seConnecter() {

    if (
      this.email.trim() === '' ||
      this.motDePasse.trim() === ''
    ) {

      this.message =
        'Veuillez remplir tous les champs.';

      return;

    }


    this.auth
      .connecter(
        this.email.trim(),
        this.motDePasse
      )
      .subscribe({

        next: () => {

          this.message = '';

          this.router.navigate(
            ['/dashboard']
          );

        },


        error: (erreur) => {

          console.error(
            'ERREUR CONNEXION :',
            erreur
          );


          if (
            erreur.status === 401
          ) {

            this.message =
              'Email ou mot de passe incorrect.';

          }

          else if (
            erreur.status === 400
          ) {

            this.message =
              'Veuillez remplir tous les champs.';

          }

          else {

            this.message =
              'Erreur de connexion au serveur.';

          }

        }

      });

  }

}


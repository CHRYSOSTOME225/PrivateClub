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

  nom = '';

  motDePasse = '';

  message = '';

  constructor(
    private router: Router,
    private auth: Auth
  ) {}

  seConnecter() {

    if (
      this.nom.trim() === '' ||
      this.motDePasse.trim() === ''
    ) {

      this.message =
        'Veuillez remplir tous les champs.';

      return;

    }

    this.auth
      .connecter(
        this.nom.trim(),
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

          if (erreur.status === 401) {

            this.message =
              'Email ou mot de passe incorrect.';

          } else {

            this.message =
              'Erreur de connexion au serveur.';

          }

        }

      });

  }

}
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


    let membres = [];

    const membresSauvegardes =
      localStorage.getItem('membres');


    if (membresSauvegardes) {

      membres =
        JSON.parse(membresSauvegardes);

    }


    /*
      COMPATIBILITÉ AVEC LES ANCIENS MEMBRES

      Si l'ancien Admin existe sans identifiant
      ni mot de passe, on lui ajoute automatiquement
      ses informations de connexion.
    */

    membres = membres.map(
      (membre: any) => {

        if (
          membre.nom === 'Jean Kouadio' &&
          membre.role === 'Admin'
        ) {

          return {
            ...membre,
            identifiant:
              membre.identifiant || 'admin',
            motDePasse:
              membre.motDePasse || '1234'
          };

        }

        return membre;

      }
    );


    /*
      SI AUCUN ADMIN N'EXISTE,
      ON CRÉE AUTOMATIQUEMENT LE COMPTE ADMIN.
    */

    const adminExiste =
      membres.some(
        (membre: any) =>
          membre.role === 'Admin'
      );


    if (!adminExiste) {

      membres.push({

        nom: 'Jean Kouadio',

        role: 'Admin',

        departement: 'Informatique',

        email: 'jean@privateclub.com',

        identifiant: 'admin',

        motDePasse: '1234'

      });

    }


    /*
      SAUVEGARDE DE LA LISTE
    */

    localStorage.setItem(
      'membres',
      JSON.stringify(membres)
    );


    /*
      RECHERCHE DU COMPTE
    */

    const membre =
      membres.find(
        (membre: any) =>

          membre.identifiant ===
          this.nom.trim()

          &&

          membre.motDePasse ===
          this.motDePasse
      );


    if (!membre) {

      this.message =
        'Identifiant ou mot de passe incorrect.';

      return;

    }


    /*
      CONNEXION RÉUSSIE
    */

    this.auth.connecter(
      membre.nom,
      membre.role
    );


    this.message = '';


    this.router.navigate(
      ['/dashboard']
    );

  }

}
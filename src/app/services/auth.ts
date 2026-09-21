import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private connecte = false;

  private role = '';

  private nom = '';


  constructor() {

    const utilisateur =
      localStorage.getItem('utilisateurConnecte');


    if (utilisateur) {

      const donnees =
        JSON.parse(utilisateur);

      this.connecte =
        donnees.connecte;

      this.role =
        donnees.role;

      this.nom =
        donnees.nom;

    }

  }


  estConnecte() {

    return this.connecte;

  }


  connecter(
    nom: string,
    role: string
  ) {

    this.connecte = true;

    this.nom = nom;

    this.role = role;


    localStorage.setItem(
      'utilisateurConnecte',
      JSON.stringify({

        connecte: true,

        nom: nom,

        role: role

      })
    );

  }


  deconnecter() {

    this.connecte = false;

    this.nom = '';

    this.role = '';


    localStorage.removeItem(
      'utilisateurConnecte'
    );

  }


  getRole() {

    return this.role;

  }


  getNom() {

    return this.nom;

  }

}
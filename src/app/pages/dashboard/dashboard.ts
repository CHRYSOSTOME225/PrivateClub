import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  nomUtilisateur = 'Utilisateur';
  roleUtilisateur = '';

  nombreMembres = 4;
  nombreAnnonces = 2;
  nombreMessages = 0;


  constructor(
    private router: Router,
    private auth: Auth
  ) {}


  ngOnInit() {

    this.nomUtilisateur =
      this.auth.getNom() || 'Utilisateur';

    this.roleUtilisateur =
      this.auth.getRole() || 'Membre';

    this.calculerStatistiques();

  }


  calculerStatistiques() {

    // NOMBRE DE MEMBRES

    const membres =
      localStorage.getItem('membres');

    if (membres) {

      const listeMembres =
        JSON.parse(membres);

      this.nombreMembres =
        listeMembres.length;

    }


    // NOMBRE D'ANNONCES

    const annonces =
      localStorage.getItem('annonces');

    if (annonces) {

      const listeAnnonces =
        JSON.parse(annonces);

      this.nombreAnnonces =
        listeAnnonces.length;

    }


    // NOMBRE DE MESSAGES

    const messages =
      localStorage.getItem('messages');

    if (messages) {

      const messagesParMembre =
        JSON.parse(messages);

      let total = 0;

      Object.keys(messagesParMembre).forEach(
        nom => {

          total +=
            messagesParMembre[nom].length;

        }
      );

      this.nombreMessages =
        total;

    }

  }


  deconnexion() {

    this.auth.deconnecter();

    this.router.navigate(['/']);

  }


  voirMembres() {

    this.router.navigate(['/membres']);

  }


  voirAnnonces() {

    this.router.navigate(['/annonces']);

  }


  voirMessagerie() {

    this.router.navigate(['/messagerie']);

  }


  voirProfil() {

    this.router.navigate(['/profil']);

  }


  ouvrirAdministration() {

    this.router.navigate(['/administration']);

  }

}
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  nomUtilisateur = 'Utilisateur';
  roleUtilisateur = '';

  nombreMembres = 0;
  nombreAnnonces = 0;
  nombreMessages = 0;

  constructor(
    private router: Router,
    private auth: Auth,
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {

    this.nomUtilisateur =
      this.auth.getNom() || 'Utilisateur';

    this.roleUtilisateur =
      this.auth.getRole() || 'Membre';

    console.log(
      'DASHBOARD - utilisateur :',
      this.nomUtilisateur
    );

    console.log(
      'DASHBOARD - rôle :',
      this.roleUtilisateur
    );

    this.calculerStatistiques();
  }

  calculerStatistiques() {

    // ==============================
    // MEMBRES
    // ==============================

    this.api
      .getUtilisateurs()
      .subscribe({
        next: (membres: any) => {

          console.log(
            'DASHBOARD - utilisateurs reçus :',
            membres
          );

          this.nombreMembres =
            membres.length;

          console.log(
            'NOMBRE DE MEMBRES :',
            this.nombreMembres
          );

          this.cdr.detectChanges();
        },

        error: (erreur: any) => {

          console.error(
            'ERREUR DASHBOARD MEMBRES :',
            erreur
          );

        }
      });


    // ==============================
    // ANNONCES
    // ==============================

    this.api
      .getAnnonces()
      .subscribe({
        next: (annonces: any) => {

          console.log(
            'DASHBOARD - annonces reçues :',
            annonces
          );

          this.nombreAnnonces =
            annonces.length;

          console.log(
            'NOMBRE D ANNONCES :',
            this.nombreAnnonces
          );

          this.cdr.detectChanges();
        },

        error: (erreur: any) => {

          console.error(
            'ERREUR DASHBOARD ANNONCES :',
            erreur
          );

        }
      });


    // ==============================
    // MESSAGES
    // ==============================

    this.nombreMessages = 0;
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
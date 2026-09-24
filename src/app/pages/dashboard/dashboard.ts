
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  Router,
  NavigationEnd
} from '@angular/router';

import { filter } from 'rxjs/operators';

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

  photoUtilisateur = '';


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


    this.chargerPhotoUtilisateur();

    this.calculerStatistiques();


    // ==========================================
    // RAFRAÎCHIR LE COMPTEUR AU RETOUR AU DASHBOARD
    // ==========================================

    this.router.events
      .pipe(
        filter(
          event =>
            event instanceof NavigationEnd
        )
      )
      .subscribe(
        (event: any) => {

          if (
            event.urlAfterRedirects ===
            '/dashboard'
          ) {

            this.calculerStatistiques();

          }

        }
      );

  }


  // ==========================================
  // CHARGER LA PHOTO
  // ==========================================

  chargerPhotoUtilisateur() {

    const idUtilisateur =
      this.auth.getId();


    if (!idUtilisateur) {

      return;

    }


    this.api
      .getUtilisateur(idUtilisateur)
      .subscribe({

        next: (utilisateur: any) => {

          this.photoUtilisateur =
            utilisateur.photo || '';


          this.nomUtilisateur =
            utilisateur.nom ||
            this.nomUtilisateur;


          this.cdr.detectChanges();

        },

        error: (erreur: any) => {

          console.error(
            'ERREUR DASHBOARD PHOTO :',
            erreur
          );

        }

      });

  }


  // ==========================================
  // CALCULER LES STATISTIQUES
  // ==========================================

  calculerStatistiques() {


    // ==========================================
    // NOMBRE DE MEMBRES
    // ==========================================

    this.api
      .getUtilisateurs()
      .subscribe({

        next: (membres: any) => {

          this.nombreMembres =
            membres.length;


          this.cdr.detectChanges();

        },

        error: (erreur: any) => {

          console.error(
            'ERREUR DASHBOARD MEMBRES :',
            erreur
          );

        }

      });


    // ==========================================
    // NOMBRE D'ANNONCES
    // ==========================================

    this.api
      .getAnnonces()
      .subscribe({

        next: (annonces: any) => {

          this.nombreAnnonces =
            annonces.length;


          this.cdr.detectChanges();

        },

        error: (erreur: any) => {

          console.error(
            'ERREUR DASHBOARD ANNONCES :',
            erreur
          );

        }

      });


    // ==========================================
    // NOMBRE DE MESSAGES NON LUS
    // ==========================================

    this.api
      .getNombreMessages()
      .subscribe({

        next: (resultat: any) => {

          this.nombreMessages =
            Number(resultat.nombre) || 0;


          console.log(
            'DASHBOARD - messages non lus :',
            this.nombreMessages
          );


          this.cdr.detectChanges();

        },

        error: (erreur: any) => {

          console.error(
            'ERREUR DASHBOARD MESSAGES :',
            erreur
          );

        }

      });

  }


  // ==========================================
  // DECONNEXION
  // ==========================================

  deconnexion() {

    this.auth.deconnecter();


    this.router.navigate([
      '/'
    ]);

  }


  // ==========================================
  // NAVIGATION
  // ==========================================

  voirMembres() {

    this.router.navigate([
      '/membres'
    ]);

  }


  voirAnnonces() {

    this.router.navigate([
      '/annonces'
    ]);

  }


  voirMessagerie() {

    this.router.navigate([
      '/messagerie'
    ]);

  }


  voirProfil() {

    this.router.navigate([
      '/profil'
    ]);

  }


  ouvrirAdministration() {

    this.router.navigate([
      '/administration'
    ]);

  }

}


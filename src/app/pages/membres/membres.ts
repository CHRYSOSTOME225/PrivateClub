import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { Router } from '@angular/router';

import { FormsModule } from '@angular/forms';

import { Auth } from '../../services/auth';

import { ApiService } from '../../services/api';


@Component({
  selector: 'app-membres',

  imports: [
    FormsModule
  ],

  templateUrl: './membres.html',

  styleUrl: './membres.css'
})
export class Membres implements OnInit {

  membres: any[] = [];

  recherche = '';

  roleUtilisateur = '';

  idUtilisateur: any = null;

  messageErreur = '';


  constructor(
    private router: Router,

    private auth: Auth,

    private api: ApiService,

    private cdr: ChangeDetectorRef
  ) {}


  // =====================================================
  // INITIALISATION
  // =====================================================

  ngOnInit() {

    this.roleUtilisateur =
      this.auth.getRole();

    this.idUtilisateur =
      this.auth.getId();

    this.chargerMembres();

  }


  // =====================================================
  // CHARGER LES MEMBRES
  // =====================================================

  chargerMembres() {

    this.api
      .getUtilisateurs()
      .subscribe({

        next: (resultats: any) => {

          this.membres =
            resultats;

          this.cdr.detectChanges();

        },

        error: (erreur: any) => {

          console.error(
            'ERREUR MEMBRES :',
            erreur
          );

          this.messageErreur =
            'Impossible de charger les membres.';

        }

      });

  }


  // =====================================================
  // FILTRER LES MEMBRES
  // =====================================================

  get membresFiltres() {

    const texte =
      this.recherche
        .toLowerCase()
        .trim();


    if (texte === '') {

      return this.membres;

    }


    return this.membres.filter(
      membre =>

        membre.nom
          ?.toLowerCase()
          .includes(texte)

        ||

        membre.role
          ?.toLowerCase()
          .includes(texte)

        ||

        membre.departement
          ?.toLowerCase()
          .includes(texte)

    );

  }


  // =====================================================
  // VÉRIFIER SI ON PEUT CONTACTER UN MEMBRE
  // =====================================================

  peutEnvoyerMessage(
    membre: any
  ): boolean {

    if (!membre) {

      return false;

    }


    // Impossible de s'envoyer
    // un message à soi-même

    if (
      Number(membre.id) ===
      Number(this.idUtilisateur)
    ) {

      return false;

    }


    // ADMIN

    if (
      this.roleUtilisateur === 'Admin'
    ) {

      return true;

    }


    // RESPONSABLE

    if (
      this.roleUtilisateur === 'Responsable'
    ) {

      return (
        membre.role === 'Admin' ||
        membre.role === 'Membre'
      );

    }


    // MEMBRE

    if (
      this.roleUtilisateur === 'Membre'
    ) {

      return (
        membre.role === 'Responsable' ||
        membre.role === 'Membre'
      );

    }


    return false;

  }


  // =====================================================
  // VÉRIFIER MON PROFIL
  // =====================================================

  estMonProfil(
    membre: any
  ): boolean {

    return (
      Number(membre.id) ===
      Number(this.idUtilisateur)
    );

  }


  // =====================================================
  // OUVRIR LA MESSAGERIE
  // =====================================================

  ouvrirMessagerie(
    nom: string
  ) {

    const membre =
      this.membres.find(
        m =>
          m.nom === nom
      );


    if (!membre) {

      return;

    }


    this.router.navigate(
      ['/messagerie'],
      {
        queryParams: {
          id: membre.id
        }
      }
    );

  }


  // =====================================================
  // RETOUR DASHBOARD
  // =====================================================

  retourDashboard() {

    this.router.navigate(
      ['/dashboard']
    );

  }

  allerAccueil() {
  this.router.navigate(['/dashboard']);
}

allerAnnonces() {
  this.router.navigate(['/annonces']);
}

allerMessagerie() {
  this.router.navigate(['/messagerie']);
}

allerProfil() {
  this.router.navigate(['/profil']);
}

allerAdministration() {
  this.router.navigate(['/administration']);
}

}
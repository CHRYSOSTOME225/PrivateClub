
import { Component, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-annonces',
  imports: [FormsModule, DatePipe],
  templateUrl: './annonces.html',
  styleUrl: './annonces.css'
})
export class Annonces {

  roleUtilisateur = '';

  annonces: any[] = [];

  formulaireVisible = false;

  nouveauTitre = '';
  nouveauContenu = '';

  message = '';


  constructor(
    private router: Router,
    public auth: Auth,
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit() {

    this.roleUtilisateur =
      this.auth.getRole();

    this.chargerAnnonces();

  }


  // ===============================
  // CHARGER LES ANNONCES
  // ===============================

  chargerAnnonces() {

    this.api
      .getAnnonces()
      .subscribe({

        next: (resultats: any) => {

          this.annonces =
            resultats;

          this.cdr.detectChanges();

        },

        error: (erreur) => {

          console.error(
            'ERREUR CHARGEMENT ANNONCES :',
            erreur
          );

          this.message =
            'Impossible de charger les annonces.';

        }

      });

  }


  // ===============================
  // OUVRIR LE FORMULAIRE
  // ===============================

  ouvrirFormulaire() {

    this.nouveauTitre = '';

    this.nouveauContenu = '';

    this.message = '';

    this.formulaireVisible =
      true;

  }


  // ===============================
  // PUBLIER UNE ANNONCE
  // ===============================

  publierAnnonce() {

    if (
      this.nouveauTitre.trim() === '' ||
      this.nouveauContenu.trim() === ''
    ) {

      this.message =
        'Veuillez remplir tous les champs.';

      return;

    }


    // L'ID de l'auteur n'est plus
    // envoyé depuis le frontend.
    // Le backend récupère automatiquement
    // l'Admin connecté grâce au JWT.

    const donnees = {

      titre:
        this.nouveauTitre.trim(),

      contenu:
        this.nouveauContenu.trim()

    };


    this.api
      .creerAnnonce(donnees)
      .subscribe({

        next: () => {

          this.nouveauTitre = '';

          this.nouveauContenu = '';

          this.formulaireVisible =
            false;

          this.message = '';

          this.chargerAnnonces();

        },

        error: (erreur) => {

          console.error(
            'ERREUR PUBLICATION :',
            erreur
          );


          if (
            erreur.status === 401
          ) {

            this.message =
              'Vous devez être connecté pour publier une annonce.';

          }

          else if (
            erreur.status === 403
          ) {

            this.message =
              'Seul un Admin peut publier une annonce.';

          }

          else {

            this.message =
              'Erreur lors de la publication.';

          }

        }

      });

  }


  // ===============================
  // SUPPRIMER UNE ANNONCE
  // ===============================

  supprimerAnnonce(
    id: number
  ) {

    const confirmation =
      confirm(
        'Voulez-vous supprimer cette annonce ?'
      );


    if (!confirmation) {

      return;

    }


    this.api
      .supprimerAnnonce(id)
      .subscribe({

        next: () => {

          this.message = '';

          this.chargerAnnonces();

        },

        error: (erreur) => {

          console.error(
            'ERREUR SUPPRESSION :',
            erreur
          );


          if (
            erreur.status === 403
          ) {

            this.message =
              'Seul un Admin peut supprimer une annonce.';

          }

          else {

            this.message =
              'Erreur lors de la suppression.';

          }

        }

      });

  }


  // ===============================
  // RETOUR DASHBOARD
  // ===============================

  retourDashboard() {

    this.router.navigate(
      ['/dashboard']
    );

  }

}


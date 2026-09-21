import { Component, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Auth } from '../../services/auth';

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

  private apiUrl =
    'http://localhost:3000/api/annonces';


  constructor(
    private router: Router,
    public auth: Auth,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit() {

    this.roleUtilisateur =
      this.auth.getRole();

    this.chargerAnnonces();

  }


  // Charger les annonces depuis MySQL
  chargerAnnonces() {

    this.http
      .get<any[]>(this.apiUrl)
      .subscribe({

        next: (resultats) => {

          this.annonces = resultats;

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


  // Ouvrir le formulaire
  ouvrirFormulaire() {

    this.nouveauTitre = '';

    this.nouveauContenu = '';

    this.message = '';

    this.formulaireVisible = true;

  }


  // Publier une annonce
  publierAnnonce() {

    if (
      this.nouveauTitre.trim() === '' ||
      this.nouveauContenu.trim() === ''
    ) {

      this.message =
        'Veuillez remplir tous les champs.';

      return;

    }


    const utilisateur =
      localStorage.getItem(
        'utilisateurConnecte'
      );


    if (!utilisateur) {

      this.message =
        'Utilisateur non connecté.';

      return;

    }


    const donneesUtilisateur =
      JSON.parse(utilisateur);


    const donnees = {

      titre:
        this.nouveauTitre.trim(),

      contenu:
        this.nouveauContenu.trim(),

      auteur_id:
        donneesUtilisateur.id

    };


    this.http
      .post(
        this.apiUrl,
        donnees
      )
      .subscribe({

        next: () => {

          this.nouveauTitre = '';

          this.nouveauContenu = '';

          this.formulaireVisible = false;

          this.message = '';

          this.chargerAnnonces();

        },

        error: (erreur) => {

          console.error(
            'ERREUR PUBLICATION :',
            erreur
          );

          this.message =
            'Erreur lors de la publication.';

        }

      });

  }


  // Supprimer une annonce
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


    this.http
      .delete(
        `${this.apiUrl}/${id}`
      )
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

          this.message =
            'Erreur lors de la suppression.';

        }

      });

  }


  // Retour au dashboard
  retourDashboard() {

    this.router.navigate(
      ['/dashboard']
    );

  }

}
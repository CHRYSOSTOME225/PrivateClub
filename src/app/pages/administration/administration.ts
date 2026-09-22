
import {
  Component,
  ChangeDetectorRef
} from '@angular/core';

import { Router } from '@angular/router';

import { FormsModule } from '@angular/forms';

import { Auth } from '../../services/auth';

import { ApiService } from '../../services/api';


@Component({
  selector: 'app-administration',
  imports: [FormsModule],
  templateUrl: './administration.html',
  styleUrl: './administration.css'
})
export class Administration {

  membres: any[] = [];

  recherche = '';

  formulaireVisible = false;

  modeModification = false;

  membreModifieId: number | null = null;

  nouveauNom = '';

  nouveauRole = 'Membre';

  nouveauDepartement = '';

  nouvelEmail = '';

  nouvelIdentifiant = '';

  nouveauMotDePasse = '';

  afficherMotDePasse = false;

  message = '';


  constructor(
    private router: Router,
    private auth: Auth,
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit() {

    // Vérification côté frontend
    if (
      this.auth.getRole() !== 'Admin'
    ) {

      this.router.navigate(
        ['/dashboard']
      );

      return;

    }

    this.chargerMembres();

  }


  // ==============================
  // CHARGER LES MEMBRES
  // ==============================

  chargerMembres() {

    this.api
      .getUtilisateurs()
      .subscribe({

        next: (resultats: any) => {

          this.membres =
            resultats;

          console.log(
            'MEMBRES ADMINISTRATION :',
            this.membres
          );

          this.cdr.detectChanges();

        },

        error: (erreur: any) => {

          console.error(
            'ERREUR CHARGEMENT MEMBRES :',
            erreur
          );

          if (
            erreur.status === 401
          ) {

            this.message =
              'Votre session a expiré.';

          }

          else if (
            erreur.status === 403
          ) {

            this.message =
              'Accès réservé à l’Admin.';

          }

          else {

            this.message =
              'Impossible de charger les membres.';

          }

        }

      });

  }


  // ==============================
  // RECHERCHE
  // ==============================

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
          .toLowerCase()
          .includes(texte)

        ||

        membre.role
          .toLowerCase()
          .includes(texte)

        ||

        (membre.departement || '')
          .toLowerCase()
          .includes(texte)

        ||

        membre.email
          .toLowerCase()
          .includes(texte)

    );

  }


  // ==============================
  // AJOUTER UN MEMBRE
  // ==============================

  ouvrirAjout() {

    this.modeModification =
      false;

    this.membreModifieId =
      null;

    this.nouveauNom =
      '';

    this.nouveauRole =
      'Membre';

    this.nouveauDepartement =
      '';

    this.nouvelEmail =
      '';

    this.nouvelIdentifiant =
      '';

    this.nouveauMotDePasse =
      '';

    this.afficherMotDePasse =
      false;

    this.message =
      '';

    this.formulaireVisible =
      true;

  }


  // ==============================
  // MODIFIER UN MEMBRE
  // ==============================

  ouvrirModification(
    membre: any
  ) {

    this.modeModification =
      true;

    this.membreModifieId =
      membre.id;

    this.nouveauNom =
      membre.nom;

    this.nouveauRole =
      membre.role;

    this.nouveauDepartement =
      membre.departement || '';

    this.nouvelEmail =
      membre.email;

    this.nouvelIdentifiant =
      membre.email;

    // Le mot de passe est vide
    // par défaut lors d'une modification.
    this.nouveauMotDePasse =
      '';

    this.afficherMotDePasse =
      false;

    this.message =
      '';

    this.formulaireVisible =
      true;

  }


  // ==============================
  // AFFICHER / CACHER MOT DE PASSE
  // ==============================

  basculerMotDePasse() {

    this.afficherMotDePasse =
      !this.afficherMotDePasse;

  }


  // ==============================
  // ENREGISTRER
  // ==============================

  enregistrerMembre() {

    // Champs obligatoires communs
    if (
      this.nouveauNom.trim() === '' ||
      this.nouveauDepartement.trim() === '' ||
      this.nouvelEmail.trim() === ''
    ) {

      this.message =
        'Veuillez remplir tous les champs obligatoires.';

      return;

    }


    // Mot de passe obligatoire
    // uniquement lors de la création
    if (
      !this.modeModification &&
      this.nouveauMotDePasse.trim() === ''
    ) {

      this.message =
        'Le mot de passe est obligatoire pour créer un membre.';

      return;

    }


    const donnees: any = {

      nom:
        this.nouveauNom.trim(),

      email:
        this.nouvelEmail.trim(),

      role:
        this.nouveauRole,

      departement:
        this.nouveauDepartement.trim()

    };


    // Ajouter le mot de passe
    // seulement s'il a été renseigné
    if (
      this.nouveauMotDePasse.trim() !== ''
    ) {

      donnees.motDePasse =
        this.nouveauMotDePasse.trim();

    }


    // ==============================
    // MODIFICATION
    // ==============================

    if (
      this.modeModification
    ) {

      this.api
        .modifierUtilisateur(
          this.membreModifieId!,
          donnees
        )
        .subscribe({

          next: () => {

            this.formulaireVisible =
              false;

            this.message =
              '';

            this.chargerMembres();

          },

          error: (erreur: any) => {

            console.error(
              'ERREUR MODIFICATION :',
              erreur
            );


            if (
              erreur.status === 401
            ) {

              this.message =
                'Votre session a expiré.';

            }

            else if (
              erreur.status === 403
            ) {

              this.message =
                'Vous n’avez pas les droits nécessaires.';

            }

            else if (
              erreur.status === 409
            ) {

              this.message =
                'Cette adresse email est déjà utilisée.';

            }

            else {

              this.message =
                'Erreur lors de la modification.';

            }

          }

        });

    }


    // ==============================
    // CREATION
    // ==============================

    else {

      this.api
        .creerUtilisateur(
          donnees
        )
        .subscribe({

          next: () => {

            this.formulaireVisible =
              false;

            this.message =
              '';

            this.chargerMembres();

          },

          error: (erreur: any) => {

            console.error(
              'ERREUR CREATION :',
              erreur
            );


            if (
              erreur.status === 401
            ) {

              this.message =
                'Votre session a expiré.';

            }

            else if (
              erreur.status === 403
            ) {

              this.message =
                'Seul un Admin peut créer un membre.';

            }

            else if (
              erreur.status === 409
            ) {

              this.message =
                'Cette adresse email est déjà utilisée.';

            }

            else {

              this.message =
                'Erreur lors de la création du membre.';

            }

          }

        });

    }

  }


  // ==============================
  // SUPPRIMER
  // ==============================

  supprimerMembre(
    membre: any
  ) {

    // Protection frontend
    if (
      membre.role === 'Admin'
    ) {

      this.message =
        'Le compte Admin ne peut pas être supprimé.';

      return;

    }


    const confirmation =
      confirm(
        `Voulez-vous supprimer ${membre.nom} ?`
      );


    if (!confirmation) {

      return;

    }


    this.api
      .supprimerUtilisateur(
        membre.id
      )
      .subscribe({

        next: () => {

          this.message =
            '';

          this.chargerMembres();

        },

        error: (erreur: any) => {

          console.error(
            'ERREUR SUPPRESSION :',
            erreur
          );


          if (
            erreur.status === 401
          ) {

            this.message =
              'Votre session a expiré.';

          }

          else if (
            erreur.status === 403
          ) {

            this.message =
              'Seul un Admin peut supprimer un membre.';

          }

          else {

            this.message =
              'Erreur lors de la suppression.';

          }

        }

      });

  }


  // ==============================
  // FERMER
  // ==============================

  fermerFormulaire() {

    this.formulaireVisible =
      false;

    this.message =
      '';

  }


  // ==============================
  // RETOUR DASHBOARD
  // ==============================

  retourDashboard() {

    this.router.navigate(
      ['/dashboard']
    );

  }

}

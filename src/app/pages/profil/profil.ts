import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { Auth } from '../../services/auth';

import { ApiService } from '../../services/api';


@Component({
  selector: 'app-profil',
  imports: [FormsModule],
  templateUrl: './profil.html',
  styleUrl: './profil.css'
})
export class Profil implements OnInit {

  nom = '';

  email = '';

  telephone = '';

  poste = '';

  departement = '';

  matricule = '';

  photo = '';

  nouveauMotDePasse = '';

  confirmationMotDePasse = '';

  modeModification = false;

  modeMotDePasse = false;

  message = '';

  motDePasseMessage = '';

  idUtilisateur = 0;


  constructor(
    private router: Router,
    private auth: Auth,
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit() {

    // Récupérer l'ID depuis Auth
    this.idUtilisateur =
      this.auth.getId();


    if (!this.idUtilisateur) {

      this.router.navigate(['/']);

      return;

    }


    this.chargerProfil();

  }


  // ===============================
  // CHARGER LE PROFIL
  // ===============================

  chargerProfil() {

    if (!this.idUtilisateur) {

      return;

    }


    this.api
      .getUtilisateur(
        this.idUtilisateur
      )
      .subscribe({

        next: (utilisateur: any) => {

          this.nom =
            utilisateur.nom || '';

          this.email =
            utilisateur.email || '';

          this.telephone =
            utilisateur.telephone || '';

          this.poste =
            utilisateur.poste || '';

          this.departement =
            utilisateur.departement || '';

          this.photo =
            utilisateur.photo || '';

          this.matricule =
            utilisateur.matricule || '';


          // Mettre à jour les données
          // enregistrées localement
          const anciennesDonnees =
            localStorage.getItem(
              'utilisateurConnecte'
            );


          if (anciennesDonnees) {

            const donnees =
              JSON.parse(
                anciennesDonnees
              );


            donnees.nom =
              utilisateur.nom;

            donnees.email =
              utilisateur.email;

            donnees.telephone =
              utilisateur.telephone;

            donnees.poste =
              utilisateur.poste;

            donnees.departement =
              utilisateur.departement;

            donnees.photo =
              utilisateur.photo;


            localStorage.setItem(
              'utilisateurConnecte',
              JSON.stringify(donnees)
            );

          }


          this.cdr.detectChanges();

        },

        error: (erreur: any) => {

          console.error(
            'ERREUR CHARGEMENT PROFIL :',
            erreur
          );

          this.message =
            'Impossible de charger le profil.';

        }

      });

  }


  // ===============================
  // ACTIVER MODIFICATION
  // ===============================

  modifierProfil() {

    this.modeModification =
      true;

    this.message =
      '';

  }


  // ===============================
  // ENREGISTRER LE PROFIL
  // ===============================

  enregistrerProfil() {

    if (
      this.nom.trim() === '' ||
      this.email.trim() === ''
    ) {

      this.message =
        'Le nom et l’adresse email sont obligatoires.';

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

      nom:
        this.nom.trim(),

      email:
        this.email.trim(),

      motDePasse:
        '',

      role:
        donneesUtilisateur.role,

      departement:
        donneesUtilisateur.departement,

      telephone:
        this.telephone.trim(),

      poste:
        this.poste.trim(),

      photo:
        this.photo.trim()

    };


    this.api
      .modifierUtilisateur(
        this.idUtilisateur,
        donnees
      )
      .subscribe({

        next: () => {

          const donneesLocales =
            JSON.parse(
              localStorage.getItem(
                'utilisateurConnecte'
              ) || '{}'
            );


          donneesLocales.nom =
            this.nom.trim();

          donneesLocales.email =
            this.email.trim();

          donneesLocales.telephone =
            this.telephone.trim();

          donneesLocales.photo =
            this.photo.trim();

          donneesLocales.poste =
            this.poste.trim();

          donneesLocales.departement =
            this.departement.trim();


          localStorage.setItem(
            'utilisateurConnecte',
            JSON.stringify(
              donneesLocales
            )
          );


          this.modeModification =
            false;

          this.message =
            'Profil mis à jour avec succès.';


          this.cdr.detectChanges();

        },

        error: (erreur: any) => {

          console.error(
            'ERREUR MODIFICATION PROFIL :',
            erreur
          );


          if (
            erreur.status === 409
          ) {

            this.message =
              'Cette adresse email est déjà utilisée.';

          } else {

            this.message =
              'Erreur lors de la modification du profil.';

          }

        }

      });

  }


  // ===============================
  // AFFICHER / MASQUER MOT DE PASSE
  // ===============================

  modifierMotDePasse() {

    this.modeMotDePasse =
      !this.modeMotDePasse;

    this.motDePasseMessage =
      '';

  }


  // ===============================
  // MODIFIER MOT DE PASSE
  // ===============================

  enregistrerMotDePasse(
    nouveauMotDePasse: string,
    confirmationMotDePasse: string
  ) {

    if (
      nouveauMotDePasse.trim() === '' ||
      confirmationMotDePasse.trim() === ''
    ) {

      this.motDePasseMessage =
        'Veuillez remplir les deux champs.';

      return;

    }


    if (
      nouveauMotDePasse !==
      confirmationMotDePasse
    ) {

      this.motDePasseMessage =
        'Les mots de passe ne correspondent pas.';

      return;

    }


    const utilisateur =
      localStorage.getItem(
        'utilisateurConnecte'
      );


    if (!utilisateur) {

      this.motDePasseMessage =
        'Utilisateur non connecté.';

      return;

    }


    const donneesUtilisateur =
      JSON.parse(utilisateur);


    const donnees = {

      nom:
        donneesUtilisateur.nom,

      email:
        donneesUtilisateur.email,

      motDePasse:
        nouveauMotDePasse,

      role:
        donneesUtilisateur.role,

      departement:
        donneesUtilisateur.departement,

      telephone:
        donneesUtilisateur.telephone || '',

      poste:
        donneesUtilisateur.poste || '',

      photo:
        donneesUtilisateur.photo || ''

    };


    this.api
      .modifierUtilisateur(
        this.idUtilisateur,
        donnees
      )
      .subscribe({

        next: () => {

          this.nouveauMotDePasse =
            '';

          this.confirmationMotDePasse =
            '';

          this.modeMotDePasse =
            false;

          this.motDePasseMessage =
            'Mot de passe modifié avec succès.';


          this.cdr.detectChanges();

        },

        error: (erreur: any) => {

          console.error(
            'ERREUR MOT DE PASSE :',
            erreur
          );

          this.motDePasseMessage =
            'Erreur lors de la modification du mot de passe.';

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
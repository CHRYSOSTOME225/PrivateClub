
import {
  Component,
  ChangeDetectorRef
} from '@angular/core';

import {
  DatePipe
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  DomSanitizer,
  SafeResourceUrl
} from '@angular/platform-browser';

import {
  Auth
} from '../../services/auth';

import {
  ApiService
} from '../../services/api';


@Component({
  selector: 'app-annonces',

  imports: [
    FormsModule,
    DatePipe
  ],

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

  fichierSelectionne: File | null = null;

  nomFichier = '';


  constructor(
    private router: Router,

    public auth: Auth,

    private api: ApiService,

    private cdr: ChangeDetectorRef,

    private sanitizer: DomSanitizer
  ) {}


  ngOnInit() {

    this.roleUtilisateur =
      this.auth.getRole();

    this.chargerAnnonces();

  }


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


  ouvrirFormulaire() {

    this.nouveauTitre = '';

    this.nouveauContenu = '';

    this.fichierSelectionne = null;

    this.nomFichier = '';

    this.message = '';

    this.formulaireVisible =
      true;

  }


  fermerFormulaire() {

    this.formulaireVisible =
      false;

    this.nouveauTitre = '';

    this.nouveauContenu = '';

    this.fichierSelectionne = null;

    this.nomFichier = '';

    this.message = '';

  }


  selectionnerFichier(
    evenement: Event
  ) {

    const input =
      evenement.target as HTMLInputElement;


    if (
      !input.files ||
      input.files.length === 0
    ) {

      this.fichierSelectionne =
        null;

      this.nomFichier =
        '';

      return;

    }


    const fichier =
      input.files[0];


    const tailleMax =
      10 * 1024 * 1024;


    const extensionsAutorisees = [

      'jpg',
      'jpeg',
      'png',
      'webp',

      'pdf',

      'doc',
      'docx',

      'xls',
      'xlsx',

      'ppt',
      'pptx',

      'txt'

    ];


    const extension =
      fichier.name
        .split('.')
        .pop()
        ?.toLowerCase();


    if (
      !extension ||
      !extensionsAutorisees.includes(
        extension
      )
    ) {

      this.message =
        'Type de fichier non autorisé.';

      input.value = '';

      this.fichierSelectionne =
        null;

      this.nomFichier =
        '';

      return;

    }


    if (
      fichier.size > tailleMax
    ) {

      this.message =
        'Le fichier ne doit pas dépasser 10 Mo.';

      input.value = '';

      this.fichierSelectionne =
        null;

      this.nomFichier =
        '';

      return;

    }


    this.fichierSelectionne =
      fichier;

    this.nomFichier =
      fichier.name;

    this.message = '';

  }


  retirerFichier() {

    this.fichierSelectionne =
      null;

    this.nomFichier =
      '';

  }


  publierAnnonce() {

    if (
      this.nouveauTitre.trim() === '' ||
      this.nouveauContenu.trim() === ''
    ) {

      this.message =
        'Veuillez remplir tous les champs.';

      return;

    }


    const formulaire =
      new FormData();


    formulaire.append(
      'titre',
      this.nouveauTitre.trim()
    );


    formulaire.append(
      'contenu',
      this.nouveauContenu.trim()
    );


    if (
      this.fichierSelectionne
    ) {

      formulaire.append(
        'fichier',
        this.fichierSelectionne
      );

    }


    this.api
      .creerAnnonce(formulaire)
      .subscribe({

        next: () => {

          this.nouveauTitre = '';

          this.nouveauContenu = '';

          this.fichierSelectionne =
            null;

          this.nomFichier =
            '';

          this.formulaireVisible =
            false;

          this.message =
            '';

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

          else if (
            erreur.status === 413
          ) {

            this.message =
              'Le fichier est trop volumineux.';

          }

          else {

            this.message =
              erreur?.error?.message ||
              'Erreur lors de la publication.';

          }

        }

      });

  }


  estImage(
    annonce: any
  ): boolean {

    if (
      annonce?.type_fichier
    ) {

      return annonce.type_fichier
        .toLowerCase()
        .startsWith('image/');

    }


    const nom =
      annonce?.nom_fichier ||
      annonce?.fichier ||
      '';


    return /\.(jpg|jpeg|png|webp)$/i
      .test(nom);

  }


  estPdf(
    annonce: any
  ): boolean {

    if (
      annonce?.type_fichier
        ?.toLowerCase() ===
      'application/pdf'
    ) {

      return true;

    }


    const nom =
      annonce?.nom_fichier ||
      annonce?.fichier ||
      '';


    return /\.pdf$/i.test(nom);

  }


  obtenirUrlFichier(
    fichier: string
  ): string {

    return 'http://localhost:3000' + fichier;

  }


  obtenirUrlPdf(
    fichier: string
  ): SafeResourceUrl {

    return this.sanitizer
      .bypassSecurityTrustResourceUrl(
        this.obtenirUrlFichier(fichier)
      );

  }


  obtenirExtension(
    nom: string
  ): string {

    if (!nom) {

      return 'FICHIER';

    }


    const morceaux =
      nom.split('.');


    if (
      morceaux.length < 2
    ) {

      return 'FICHIER';

    }


    return morceaux
      .pop()
      ?.toUpperCase() ||
      'FICHIER';

  }


  ouvrirFichier(
    fichier: string
  ) {

    window.open(
      this.obtenirUrlFichier(fichier),
      '_blank'
    );

  }


  supprimerAnnonce(
    id: number,
    evenement?: Event
  ) {

    if (evenement) {

      evenement.stopPropagation();

    }


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


  retourDashboard() {

    this.router.navigate([
      '/dashboard'
    ]);

  }


  allerAccueil() {

    this.router.navigate([
      '/dashboard'
    ]);

  }


  allerMembres() {

    this.router.navigate([
      '/membres'
    ]);

  }


  allerMessagerie() {

    this.router.navigate([
      '/messagerie'
    ]);

  }


  allerProfil() {

    this.router.navigate([
      '/profil'
    ]);

  }


  allerAdministration() {

    this.router.navigate([
      '/administration'
    ]);

  }

}



import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { DatePipe } from '@angular/common';

import {
  Router,
  ActivatedRoute
} from '@angular/router';

import { FormsModule } from '@angular/forms';

import { Auth } from '../../services/auth';

import { ApiService } from '../../services/api';


@Component({
  selector: 'app-messagerie',

  imports: [
    FormsModule,
    DatePipe
  ],

  templateUrl: './messagerie.html',

  styleUrl: './messagerie.css'
})


export class Messagerie implements OnInit {


  membreSelectionne = '';

  idMembreSelectionne: number | null = null;

  roleUtilisateur = '';

  nomUtilisateur = '';

  idUtilisateur: any = null;

  recherche = '';

  nouveauMessage = '';

  membres: any[] = [];

  messages: any[] = [];

  messageErreur = '';


  fichierSelectionne: File | null = null;

  nomFichier = '';


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private auth: Auth,
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit() {

    this.roleUtilisateur =
      this.auth.getRole();

    this.nomUtilisateur =
      this.auth.getNom();

    this.idUtilisateur =
      this.auth.getId();


    this.route.queryParams.subscribe(params => {

      const id = Number(params['id']);

      if (id) {

        this.idMembreSelectionne = id;

      }

      this.mettreAJourMembreSelectionne();

      this.chargerMessages();

    });


    this.chargerMembres();

  }


  chargerMembres() {

    this.api
      .getUtilisateurs()
      .subscribe({

        next: (resultats: any) => {

          this.membres = resultats;

          this.mettreAJourMembreSelectionne();

          this.cdr.detectChanges();


          if (
            this.idMembreSelectionne !== null
          ) {

            this.chargerMessages();

          }

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


  mettreAJourMembreSelectionne() {

    if (
      this.idMembreSelectionne === null
    ) {

      return;

    }


    const membre =
      this.membres.find(
        m =>
          Number(m.id) ===
          Number(this.idMembreSelectionne)
      );


    if (membre) {

      this.membreSelectionne =
        membre.nom;

    }

  }


  getMembreSelectionne() {

    return this.membres.find(
      membre =>
        Number(membre.id) ===
        Number(this.idMembreSelectionne)
    );

  }


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

    );

  }


  selectionnerMembre(
    id: number
  ) {

    const membre =
      this.membres.find(
        m =>
          Number(m.id) ===
          Number(id)
      );


    if (!membre) {

      return;

    }


    this.idMembreSelectionne =
      Number(membre.id);

    this.membreSelectionne =
      membre.nom;

    this.nouveauMessage =
      '';

    this.messageErreur =
      '';

    this.messages =
      [];


    this.retirerFichier();


    this.router.navigate(
      ['/messagerie'],
      {
        queryParams: {
          id: membre.id
        }
      }
    );


    this.chargerMessages();

  }


  /**
   * Détermine si un membre doit apparaître
   * dans la liste des conversations.
   *
   * Un Membre peut voir les Admins,
   * mais ne peut pas leur répondre.
   */
  peutAfficherMembre(
    membre: any
  ): boolean {

    if (!membre) {

      return false;

    }


    if (
      Number(membre.id) ===
      Number(this.idUtilisateur)
    ) {

      return false;

    }


    // Admin peut voir tout le monde
    if (
      this.roleUtilisateur ===
      'Admin'
    ) {

      return true;

    }


    // Responsable peut voir Admins + Membres
    if (
      this.roleUtilisateur ===
      'Responsable'
    ) {

      return (
        membre.role === 'Admin' ||
        membre.role === 'Membre'
      );

    }


    // Membre peut VOIR les Admins,
    // mais ne pourra pas leur répondre.
    if (
      this.roleUtilisateur ===
      'Membre'
    ) {

      return (
        membre.role === 'Admin' ||
        membre.role === 'Responsable' ||
        membre.role === 'Membre'
      );

    }


    return false;

  }


  /**
   * Détermine si l'utilisateur a le droit
   * d'envoyer un message à ce membre.
   */
  peutContacter(
    id: number
  ): boolean {

    const membre =
      this.membres.find(
        m =>
          Number(m.id) ===
          Number(id)
      );


    if (!membre) {

      return false;

    }


    if (
      Number(membre.id) ===
      Number(this.idUtilisateur)
    ) {

      return false;

    }


    // Admin → tout le monde
    if (
      this.roleUtilisateur ===
      'Admin'
    ) {

      return true;

    }


    // Responsable → Admin + Membres
    if (
      this.roleUtilisateur ===
      'Responsable'
    ) {

      return (
        membre.role === 'Admin' ||
        membre.role === 'Membre'
      );

    }


    // Membre → Responsable + Membres
    // PAS Admin
    if (
      this.roleUtilisateur ===
      'Membre'
    ) {

      return (
        membre.role === 'Responsable' ||
        membre.role === 'Membre'
      );

    }


    return false;

  }


  chargerMessages() {

    if (
      this.idMembreSelectionne === null ||
      !this.idUtilisateur
    ) {

      return;

    }


    const membre =
      this.membres.find(
        m =>
          Number(m.id) ===
          Number(this.idMembreSelectionne)
      );


    if (!membre) {

      return;

    }


    // On marque uniquement les messages reçus
    // comme lus.
    this.api
      .marquerMessagesLus(
        membre.id
      )
      .subscribe({

        next: (resultat: any) => {

          console.log(
            'MESSAGES LUS :',
            resultat.nombre
          );

        },

        error: (erreur: any) => {

          console.error(
            'ERREUR MARQUAGE :',
            erreur
          );

        }

      });


    this.api
      .getMessages(
        this.idUtilisateur,
        membre.id
      )
      .subscribe({

        next: (resultats: any) => {

          this.messages =
            resultats;

          this.cdr.detectChanges();

        },

        error: (erreur: any) => {

          console.error(
            'ERREUR MESSAGES :',
            erreur
          );

          this.messageErreur =
            'Impossible de charger les messages.';

        }

      });

  }


  selectionnerFichier(
    event: Event
  ) {

    const input =
      event.target as HTMLInputElement;


    if (
      !input.files ||
      input.files.length === 0
    ) {

      return;

    }


    const fichier =
      input.files[0];


    const tailleMax =
      10 * 1024 * 1024;


    if (
      fichier.size >
      tailleMax
    ) {

      this.messageErreur =
        'Le fichier ne doit pas dépasser 10 Mo.';

      this.fichierSelectionne =
        null;

      this.nomFichier =
        '';

      input.value =
        '';

      return;

    }


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


    const nom =
      fichier.name.toLowerCase();


    const extension =
      nom.split('.').pop();


    if (
      !extension ||
      !extensionsAutorisees.includes(
        extension
      )
    ) {

      this.messageErreur =
        'Ce type de fichier n’est pas autorisé.';

      this.fichierSelectionne =
        null;

      this.nomFichier =
        '';

      input.value =
        '';

      return;

    }


    this.fichierSelectionne =
      fichier;

    this.nomFichier =
      fichier.name;

    this.messageErreur =
      '';


    this.cdr.detectChanges();

  }


  retirerFichier() {

    this.fichierSelectionne =
      null;

    this.nomFichier =
      '';


    const input =
      document.getElementById(
        'fichierMessage'
      ) as HTMLInputElement;


    if (input) {

      input.value =
        '';

    }


    this.cdr.detectChanges();

  }


  obtenirUrlFichier(
    fichier: string
  ): string {

    return (
      'http://localhost:3000' +
      fichier
    );

  }


  ouvrirFichier(
    fichier: string
  ) {

    if (!fichier) {

      return;

    }


    const url =
      this.obtenirUrlFichier(
        fichier
      );


    window.open(
      url,
      '_blank'
    );

  }


  envoyerMessage() {

    if (
      this.idMembreSelectionne === null
    ) {

      return;

    }


    const contenu =
      this.nouveauMessage.trim();


    if (
      contenu === '' &&
      !this.fichierSelectionne
    ) {

      return;

    }


    // Sécurité : un Membre ne peut pas
    // répondre à un Admin.
    if (
      !this.peutContacter(
        this.idMembreSelectionne
      )
    ) {

      this.messageErreur =
        "Vous n'êtes pas autorisé à contacter ce membre.";

      return;

    }


    const membre =
      this.membres.find(
        m =>
          Number(m.id) ===
          Number(this.idMembreSelectionne)
      );


    if (!membre) {

      return;

    }


    this.api
      .envoyerMessageAvecFichier(
        this.idUtilisateur,
        membre.id,
        contenu,
        this.fichierSelectionne
      )
      .subscribe({

        next: () => {

          console.log(
            'MESSAGE ENVOYÉ'
          );


          this.nouveauMessage =
            '';


          this.retirerFichier();


          this.messageErreur =
            '';


          this.chargerMessages();


          this.cdr.detectChanges();

        },


        error: (erreur: any) => {

          console.error(
            'ERREUR ENVOI MESSAGE :',
            erreur
          );


          if (
            erreur?.error?.message
          ) {

            this.messageErreur =
              erreur.error.message;

          }

          else if (
            erreur?.status === 413
          ) {

            this.messageErreur =
              'Le fichier est trop volumineux.';

          }

          else if (
            erreur?.status === 403
          ) {

            this.messageErreur =
              "Vous n'êtes pas autorisé à contacter ce membre.";

          }

          else if (
            erreur?.status === 401
          ) {

            this.messageErreur =
              'Votre session a expiré. Veuillez vous reconnecter.';

          }

          else {

            this.messageErreur =
              "Erreur lors de l'envoi du message.";

          }


          this.cdr.detectChanges();

        }

      });

  }


  deconnexion() {

    this.auth.deconnecter();

    this.router.navigate([
      '/'
    ]);

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


  allerAnnonces() {

    this.router.navigate([
      '/annonces'
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


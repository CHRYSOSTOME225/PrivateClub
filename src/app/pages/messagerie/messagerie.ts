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
  imports: [FormsModule, DatePipe],
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


    console.log(
      'ID UTILISATEUR CONNECTÉ :',
      this.idUtilisateur
    );


    // ===============================
    // LIRE L'ID DU MEMBRE DANS L'URL
    // ===============================

    this.route.queryParams.subscribe(
      params => {

        const id =
          Number(params['id']);

        if (id) {

          this.idMembreSelectionne =
            id;

        }

        this.chargerMessages();

      }
    );


    this.chargerMembres();

  }


  // ===============================
  // CHARGER LES MEMBRES
  // ===============================

  chargerMembres() {

    this.api
      .getUtilisateurs()
      .subscribe({

        next: (resultats: any) => {

          this.membres =
            resultats;

          this.mettreAJourMembreSelectionne();

          this.cdr.detectChanges();


          if (
            this.idMembreSelectionne
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


  // ===============================
  // METTRE À JOUR LE MEMBRE SÉLECTIONNÉ
  // ===============================

  mettreAJourMembreSelectionne() {

    if (
      !this.idMembreSelectionne
    ) {

      return;

    }


    const membre =
      this.membres.find(
        m =>
          Number(m.id) ===
          this.idMembreSelectionne
      );


    if (membre) {

      this.membreSelectionne =
        membre.nom;

    }

  }


  // ===============================
  // FILTRER LES MEMBRES
  // ===============================

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

    );

  }


  // ===============================
  // SÉLECTIONNER UN MEMBRE
  // ===============================

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


    console.log(
      'MEMBRE CLIQUÉ :',
      membre.nom
    );


    if (
      !this.peutContacter(
        membre.id
      )
    ) {

      console.log(
        'CONTACT NON AUTORISÉ'
      );

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

    this.messages = [];


    this.router.navigate(
      ['/messagerie'],
      {
        queryParams: {
          id: membre.id
        }
      }
    );


    this.chargerMessages();

    this.cdr.detectChanges();

  }


  // ===============================
  // VÉRIFIER LES DROITS
  // ===============================

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


    // Impossible de se contacter soi-même
    if (
      Number(membre.id) ===
      Number(this.idUtilisateur)
    ) {

      return false;

    }


    // ===============================
    // ADMIN
    // ===============================

    if (
      this.roleUtilisateur === 'Admin'
    ) {

      return true;

    }


    // ===============================
    // RESPONSABLE
    // ===============================

    if (
      this.roleUtilisateur === 'Responsable'
    ) {

      return (
        membre.role === 'Admin' ||
        membre.role === 'Membre'
      );

    }


    // ===============================
    // MEMBRE
    // ===============================

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


  // ===============================
  // CHARGER LES MESSAGES
  // ===============================

  chargerMessages() {

    if (
      !this.idMembreSelectionne ||
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


    console.log(
      'CHARGEMENT CONVERSATION AVEC :',
      membre.nom,
      'ID :',
      membre.id
    );


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


  // ===============================
  // ENVOYER UN MESSAGE
  // ===============================

  envoyerMessage() {

    if (
      !this.idMembreSelectionne ||
      this.nouveauMessage.trim() === ''
    ) {

      return;

    }


    if (
      !this.peutContacter(
        this.idMembreSelectionne
      )
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


    this.api
      .envoyerMessage(
        this.idUtilisateur,
        membre.id,
        this.nouveauMessage.trim()
      )
      .subscribe({

        next: () => {

          this.nouveauMessage =
            '';

          this.messageErreur =
            '';

          this.chargerMessages();

        },

        error: (erreur: any) => {

          console.error(
            'ERREUR ENVOI MESSAGE :',
            erreur
          );

          this.messageErreur =
            "Erreur lors de l'envoi du message.";

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

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

  roleUtilisateur = '';

  nomUtilisateur = '';

  idUtilisateur = 0;

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


    // Lire le membre sélectionné dans l'URL
    this.route.queryParams.subscribe(
      params => {

        const membre =
          params['membre'];

        if (membre) {

          this.membreSelectionne =
            membre;

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

          this.cdr.detectChanges();


          if (
            this.membreSelectionne
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
    nom: string
  ) {

    console.log(
      'MEMBRE CLIQUÉ :',
      nom
    );


    if (
      !this.peutContacter(nom)
    ) {

      console.log(
        'CONTACT NON AUTORISÉ'
      );

      return;

    }


    this.membreSelectionne =
      nom;

    this.nouveauMessage =
      '';

    this.messageErreur =
      '';

    this.messages = [];


    this.router.navigate(
      ['/messagerie'],
      {
        queryParams: {
          membre: nom
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
    nom: string
  ): boolean {

    const membre =
      this.membres.find(
        m =>
          m.nom === nom
      );


    if (!membre) {

      return false;

    }


    // Vérifier l'utilisateur
    // connecté avec son ID
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
      !this.membreSelectionne ||
      !this.idUtilisateur
    ) {

      return;

    }


    const membre =
      this.membres.find(
        m =>
          m.nom ===
          this.membreSelectionne
      );


    if (!membre) {

      return;

    }


    console.log(
      'CHARGEMENT CONVERSATION AVEC :',
      membre.nom
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
      !this.membreSelectionne ||
      this.nouveauMessage.trim() === ''
    ) {

      return;

    }


    if (
      !this.peutContacter(
        this.membreSelectionne
      )
    ) {

      return;

    }


    const membre =
      this.membres.find(
        m =>
          m.nom ===
          this.membreSelectionne
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
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

import { HttpClient } from '@angular/common/http';

import { Auth } from '../../services/auth';


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


  private apiUtilisateurs =
    'http://localhost:3000/api/utilisateurs';

  private apiMessages =
    'http://localhost:3000/api/messages';


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private auth: Auth,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit() {

    this.roleUtilisateur =
      this.auth.getRole();

    this.nomUtilisateur =
      this.auth.getNom();


    const utilisateur =
      localStorage.getItem(
        'utilisateurConnecte'
      );


    if (utilisateur) {

      const donnees =
        JSON.parse(utilisateur);

      this.idUtilisateur =
        donnees.id;

    }


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


  // Charger les membres
  chargerMembres() {

    this.http
      .get<any[]>(
        this.apiUtilisateurs
      )
      .subscribe({

        next: (resultats) => {

          this.membres =
            resultats;

          this.cdr.detectChanges();


          // Charger la conversation
          // une fois les membres disponibles
          if (
            this.membreSelectionne
          ) {

            this.chargerMessages();

          }

        },

        error: (erreur) => {

          console.error(
            'ERREUR MEMBRES :',
            erreur
          );

          this.messageErreur =
            'Impossible de charger les membres.';

        }

      });

  }


  // Filtrer les membres
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


  // Sélectionner un membre
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


    // Sélection immédiate
    this.membreSelectionne =
      nom;

    this.nouveauMessage =
      '';

    this.messageErreur =
      '';

    this.messages = [];


    // Mettre le membre dans l'URL
    this.router.navigate(
      ['/messagerie'],
      {
        queryParams: {
          membre: nom
        }
      }
    );


    // Charger les messages
    this.chargerMessages();


    this.cdr.detectChanges();

  }


  // Vérifier les droits
  peutContacter(
    nom: string
  ): boolean {

    // Ne pas pouvoir se contacter soi-même
    if (
      nom === this.nomUtilisateur
    ) {

      return false;

    }


    const membre =
      this.membres.find(
        m =>
          m.nom === nom
      );


    if (!membre) {

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


  // Charger les messages
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


    this.http
      .get<any[]>(
        `${this.apiMessages}/${this.idUtilisateur}/${membre.id}`
      )
      .subscribe({

        next: (resultats) => {

          this.messages =
            resultats;

          this.cdr.detectChanges();

        },

        error: (erreur) => {

          console.error(
            'ERREUR MESSAGES :',
            erreur
          );

          this.messageErreur =
            'Impossible de charger les messages.';

        }

      });

  }


  // Envoyer un message
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


    const donnees = {

      expediteur_id:
        this.idUtilisateur,

      destinataire_id:
        membre.id,

      contenu:
        this.nouveauMessage.trim()

    };


    this.http
      .post(
        this.apiMessages,
        donnees
      )
      .subscribe({

        next: () => {

          this.nouveauMessage =
            '';

          this.messageErreur =
            '';

          this.chargerMessages();

        },

        error: (erreur) => {

          console.error(
            'ERREUR ENVOI MESSAGE :',
            erreur
          );

          this.messageErreur =
            "Erreur lors de l'envoi du message.";

        }

      });

  }


  // Retour dashboard
  retourDashboard() {

    this.router.navigate(
      ['/dashboard']
    );

  }

}
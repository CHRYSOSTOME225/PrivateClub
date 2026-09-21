import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-messagerie',
  imports: [FormsModule],
  templateUrl: './messagerie.html',
  styleUrl: './messagerie.css'
})
export class Messagerie implements OnInit {

  membreSelectionne = '';

  roleUtilisateur = '';

  nomUtilisateur = '';

  recherche = '';

  nouveauMessage = '';


  membres = [
    {
      nom: 'Jean Kouadio',
      role: 'Admin'
    },
    {
      nom: 'Marie Yao',
      role: 'Responsable'
    },
    {
      nom: 'Paul Koffi',
      role: 'Membre'
    },
    {
      nom: 'Aïcha Traoré',
      role: 'Membre'
    }
  ];


  messagesParMembre: {
    [nom: string]: {
      texte: string;
      expediteur: string;
      destinataire: string;
      heure: string;
    }[];
  } = {};


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private auth: Auth
  ) {}


  ngOnInit() {

    this.roleUtilisateur =
      this.auth.getRole();

    this.nomUtilisateur =
      this.auth.getNom();


    const membresSauvegardes =
      localStorage.getItem('membres');


    if (membresSauvegardes) {

      this.membres =
        JSON.parse(membresSauvegardes);

    }


    const messagesSauvegardes =
      localStorage.getItem('messages');


    if (messagesSauvegardes) {

      this.messagesParMembre =
        JSON.parse(messagesSauvegardes);

    }


    this.route.queryParams.subscribe(
      params => {

        this.membreSelectionne =
          params['membre'] || '';

      }
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
          .toLowerCase()
          .includes(texte)

        ||

        membre.role
          .toLowerCase()
          .includes(texte)

    );

  }


  selectionnerMembre(
    nom: string
  ) {

    if (!this.peutContacter(nom)) {

      return;

    }


    this.membreSelectionne = nom;


    this.router.navigate(
      ['/messagerie'],
      {
        queryParams: {
          membre: nom
        }
      }
    );

  }


  peutContacter(
    nom: string
  ): boolean {

    if (
      nom === this.nomUtilisateur
    ) {

      return false;

    }


    const membre =
      this.membres.find(
        m => m.nom === nom
      );


    if (!membre) {

      return false;

    }


    if (
      this.roleUtilisateur === 'Admin'
      ||
      this.roleUtilisateur === 'Responsable'
    ) {

      return true;

    }


    if (
      this.roleUtilisateur === 'Membre'
    ) {

      return (

        membre.role === 'Membre'

        ||

        membre.role === 'Responsable'

      );

    }


    return false;

  }


  envoyerMessage() {

    if (

      !this.membreSelectionne

      ||

      this.nouveauMessage
        .trim() === ''

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


    if (
      !this.messagesParMembre[
        this.membreSelectionne
      ]
    ) {

      this.messagesParMembre[
        this.membreSelectionne
      ] = [];

    }


    const maintenant =
      new Date();


    const heure =
      maintenant.toLocaleTimeString(
        'fr-FR',
        {
          hour: '2-digit',
          minute: '2-digit'
        }
      );


    this.messagesParMembre[
      this.membreSelectionne
    ].push({

      texte:
        this.nouveauMessage.trim(),

      expediteur:
        this.nomUtilisateur || 'Moi',

      destinataire:
        this.membreSelectionne,

      heure:
        heure

    });


    localStorage.setItem(
      'messages',
      JSON.stringify(
        this.messagesParMembre
      )
    );


    this.nouveauMessage = '';

  }


  retourDashboard() {

    this.router.navigate(
      ['/dashboard']
    );

  }

}
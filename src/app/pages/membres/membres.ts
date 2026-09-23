import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-membres',
  imports: [FormsModule],
  templateUrl: './membres.html',
  styleUrl: './membres.css'
})
export class Membres {

  membres: any[] = [];

  recherche = '';

  roleUtilisateur = '';

  nomUtilisateur = '';

  idUtilisateur: any = null;


  constructor(
    private router: Router,
    private auth: Auth,
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit() {

    console.log(
      'PAGE MEMBRES CHARGÉE'
    );

    this.roleUtilisateur =
      this.auth.getRole();

    this.nomUtilisateur =
      this.auth.getNom();

    this.idUtilisateur =
      this.auth.getId();


    console.log(
      'ROLE :',
      this.roleUtilisateur
    );

    console.log(
      'NOM :',
      this.nomUtilisateur
    );

    console.log(
      'ID :',
      this.idUtilisateur
    );


    this.chargerMembres();

  }


  chargerMembres() {

    console.log(
      'CHARGEMENT DES MEMBRES...'
    );


    this.api
      .getUtilisateurs()
      .subscribe({

        next: (resultats: any) => {

          console.log(
            'MEMBRES REÇUS DE MYSQL :',
            resultats
          );

          this.membres =
            resultats;

          this.cdr.detectChanges();

        },


        error: (erreur) => {

          console.error(
            'ERREUR API MEMBRES :',
            erreur
          );

        }

      });

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

        ||

        (membre.departement || '')
          .toLowerCase()
          .includes(texte)

    );

  }


  peutEnvoyerMessage(
    membre: any
  ): boolean {

    // Ne pas envoyer de message à soi-même
    if (
      membre.id == this.idUtilisateur
    ) {

      return false;

    }


    // Admin → tout le monde
    if (
      this.roleUtilisateur === 'Admin'
    ) {

      return true;

    }


    // Responsable → Admin + Membres
    if (
      this.roleUtilisateur === 'Responsable'
    ) {

      return (
        membre.role === 'Admin' ||
        membre.role === 'Membre'
      );

    }


    // Membre → Responsable + autres Membres
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
  // VÉRIFIER SI C'EST MON PROFIL
  // ===============================

  estMonProfil(
    membre: any
  ): boolean {

    return membre.id == this.idUtilisateur;

  }


  // ===============================
  // OUVRIR LA MESSAGERIE
  // ===============================

  ouvrirMessagerie(
    id: number
  ) {

    this.router.navigate(
      ['/messagerie'],
      {
        queryParams: {
          id: id
        }
      }
    );

  }


  retourDashboard() {

    this.router.navigate(
      ['/dashboard']
    );

  }

}
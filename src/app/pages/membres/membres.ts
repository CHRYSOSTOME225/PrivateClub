import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Auth } from '../../services/auth';

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

  constructor(
    private router: Router,
    private auth: Auth,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {

    console.log('PAGE MEMBRES CHARGÉE');

    this.roleUtilisateur = this.auth.getRole();

    this.nomUtilisateur = this.auth.getNom();

    console.log('ROLE :', this.roleUtilisateur);
    console.log('NOM :', this.nomUtilisateur);

    this.chargerMembres();

  }

  chargerMembres() {

    console.log('CHARGEMENT DES MEMBRES...');

    this.http
      .get<any[]>(
        'http://localhost:3000/api/utilisateurs'
      )
      .subscribe({

        next: (resultats) => {

          console.log(
            'MEMBRES REÇUS DE MYSQL :',
            resultats
          );

          this.membres = resultats;

          console.log(
            'MEMBRES DANS LE TABLEAU :',
            this.membres
          );

          // Force Angular à actualiser l'affichage
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

    return this.membres.filter(membre =>

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

  peutEnvoyerMessage(membre: any): boolean {

    if (
      membre.nom === this.nomUtilisateur
    ) {

      return false;

    }

    if (
      this.roleUtilisateur === 'Admin'
    ) {

      return true;

    }

    if (
      this.roleUtilisateur === 'Responsable'
    ) {

      return (
        membre.role === 'Admin' ||
        membre.role === 'Membre'
      );

    }

    if (
      this.roleUtilisateur === 'Membre'
    ) {

      return (
        membre.role === 'Membre' ||
        membre.role === 'Responsable'
      );

    }

    return false;

  }

  ouvrirMessagerie(nom: string) {

    this.router.navigate(
      ['/messagerie'],
      {
        queryParams: {
          membre: nom
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
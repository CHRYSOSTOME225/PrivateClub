import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-membres',
  imports: [FormsModule],
  templateUrl: './membres.html',
  styleUrl: './membres.css'
})
export class Membres {

  membres = [
    {
      nom: 'Jean Kouadio',
      role: 'Admin',
      departement: 'Informatique',
      email: 'jean@privateclub.com'
    },
    {
      nom: 'Marie Yao',
      role: 'Responsable',
      departement: 'Communication',
      email: 'marie@privateclub.com'
    },
    {
      nom: 'Paul Koffi',
      role: 'Membre',
      departement: 'Informatique',
      email: 'paul@privateclub.com'
    },
    {
      nom: 'Aïcha Traoré',
      role: 'Membre',
      departement: 'Marketing',
      email: 'aicha@privateclub.com'
    }
  ];

  recherche = '';

  roleUtilisateur = '';

  nomUtilisateur = '';


  constructor(
    private router: Router,
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

      membre.departement
        .toLowerCase()
        .includes(texte)

    );

  }


  peutEnvoyerMessage(
    membre: any
  ): boolean {

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


  ouvrirMessagerie(
    nom: string
  ) {

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
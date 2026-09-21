import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-profil',
  imports: [FormsModule],
  templateUrl: './profil.html',
  styleUrl: './profil.css'
})
export class Profil {

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

  message = '';


  constructor(
    private router: Router,
    private auth: Auth
  ) {}


  ngOnInit() {

    const nomUtilisateur =
      this.auth.getNom();


    const membresSauvegardes =
      localStorage.getItem('membres');


    if (membresSauvegardes) {

      const membres =
        JSON.parse(membresSauvegardes);


      const membre =
        membres.find(
          (m: any) =>
            m.nom === nomUtilisateur
        );


      if (membre) {

        this.nom =
          membre.nom || '';

        this.email =
          membre.email || '';

        this.poste =
          membre.role || '';

        this.departement =
          membre.departement || '';

        this.photo =
          membre.photo || '';

        this.telephone =
          membre.telephone || '';

        this.matricule =
          membre.matricule || '';

      }

    }

  }


  activerModification() {

    this.modeModification = true;

    this.message = '';

  }


  annulerModification() {

    this.modeModification = false;

    this.message = '';

    this.ngOnInit();

  }


  enregistrerProfil() {

    const membresSauvegardes =
      localStorage.getItem('membres');


    if (!membresSauvegardes) {

      return;

    }


    const membres =
      JSON.parse(membresSauvegardes);


    const index =
      membres.findIndex(
        (m: any) =>
          m.nom === this.auth.getNom()
      );


    if (index === -1) {

      return;

    }


    membres[index].nom =
      this.nom.trim();

    membres[index].email =
      this.email.trim();

    membres[index].telephone =
      this.telephone.trim();

    membres[index].photo =
      this.photo.trim();


    localStorage.setItem(
      'membres',
      JSON.stringify(membres)
    );


    this.modeModification = false;

    this.message =
      'Profil mis à jour avec succès.';

  }


  changerMotDePasse() {

    if (
      this.nouveauMotDePasse.trim() === ''
      ||
      this.confirmationMotDePasse.trim() === ''
    ) {

      this.message =
        'Veuillez remplir les deux champs.';

      return;

    }


    if (
      this.nouveauMotDePasse !==
      this.confirmationMotDePasse
    ) {

      this.message =
        'Les mots de passe ne correspondent pas.';

      return;

    }


    const membresSauvegardes =
      localStorage.getItem('membres');


    if (!membresSauvegardes) {

      return;

    }


    const membres =
      JSON.parse(membresSauvegardes);


    const index =
      membres.findIndex(
        (m: any) =>
          m.nom === this.auth.getNom()
      );


    if (index === -1) {

      return;

    }


    membres[index].motDePasse =
      this.nouveauMotDePasse.trim();


    localStorage.setItem(
      'membres',
      JSON.stringify(membres)
    );


    this.nouveauMotDePasse = '';

    this.confirmationMotDePasse = '';

    this.message =
      'Mot de passe modifié avec succès.';

  }


  retourDashboard() {

    this.router.navigate(
      ['/dashboard']
    );

  }

}
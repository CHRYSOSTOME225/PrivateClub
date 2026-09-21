import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-administration',
  imports: [FormsModule],
  templateUrl: './administration.html',
  styleUrl: './administration.css'
})
export class Administration {

  membres = [
    {
      nom: 'Jean Kouadio',
      role: 'Admin',
      departement: 'Informatique',
      email: 'jean@privateclub.com',
      identifiant: 'admin',
      motDePasse: '1234'
    },
    {
      nom: 'Marie Yao',
      role: 'Responsable',
      departement: 'Communication',
      email: 'marie@privateclub.com',
      identifiant: 'marie',
      motDePasse: '1234'
    },
    {
      nom: 'Paul Koffi',
      role: 'Membre',
      departement: 'Informatique',
      email: 'paul@privateclub.com',
      identifiant: 'paul',
      motDePasse: '1234'
    },
    {
      nom: 'Aïcha Traoré',
      role: 'Membre',
      departement: 'Marketing',
      email: 'aicha@privateclub.com',
      identifiant: 'aicha',
      motDePasse: '1234'
    }
  ];

  recherche = '';

  formulaireVisible = false;

  modeModification = false;

  membreModifieIndex = -1;

  nouveauNom = '';

  nouveauRole = 'Membre';

  nouveauDepartement = '';

  nouvelEmail = '';

  nouvelIdentifiant = '';

  nouveauMotDePasse = '';

  afficherMotDePasse = false;

  message = '';


  constructor(
    private router: Router,
    private auth: Auth
  ) {}


  ngOnInit() {

    if (this.auth.getRole() !== 'Admin') {

      this.router.navigate(['/dashboard']);

      return;

    }


    const membresSauvegardes =
      localStorage.getItem('membres');


    if (membresSauvegardes) {

      this.membres =
        JSON.parse(membresSauvegardes);

    } else {

      this.sauvegarderMembres();

    }

  }


  get membresFiltres() {

    const texte =
      this.recherche.toLowerCase().trim();


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

      ||

      membre.email
        .toLowerCase()
        .includes(texte)

      ||

      (membre.identifiant || '')
        .toLowerCase()
        .includes(texte)

    );

  }


  ouvrirAjout() {

    this.modeModification = false;

    this.membreModifieIndex = -1;

    this.nouveauNom = '';

    this.nouveauRole = 'Membre';

    this.nouveauDepartement = '';

    this.nouvelEmail = '';

    this.nouvelIdentifiant = '';

    this.nouveauMotDePasse = '';

    this.afficherMotDePasse = false;

    this.message = '';

    this.formulaireVisible = true;

  }


  ouvrirModification(membre: any) {

    this.afficherMotDePasse = false;

    const index =
      this.membres.indexOf(membre);


    if (index === -1) {

      return;

    }


    this.modeModification = true;

    this.membreModifieIndex = index;

    this.nouveauNom =
      membre.nom;

    this.nouveauRole =
      membre.role;

    this.nouveauDepartement =
      membre.departement;

    this.nouvelEmail =
      membre.email;

    this.nouvelIdentifiant =
      membre.identifiant || '';

    this.nouveauMotDePasse =
      membre.motDePasse || '';

    this.message = '';

    this.formulaireVisible = true;

  }

  basculerMotDePasse() {

  this.afficherMotDePasse =
    !this.afficherMotDePasse;

}


  enregistrerMembre() {

    if (
      this.nouveauNom.trim() === ''

      ||

      this.nouveauDepartement.trim() === ''

      ||

      this.nouvelEmail.trim() === ''

      ||

      this.nouvelIdentifiant.trim() === ''

      ||

      this.nouveauMotDePasse.trim() === ''
    ) {

      this.message =
        'Veuillez remplir tous les champs.';

      return;

    }


    const identifiantExiste =
      this.membres.some(
        (membre, index) =>

          membre.identifiant ===
          this.nouvelIdentifiant.trim()

          &&

          index !== this.membreModifieIndex
      );


    if (identifiantExiste) {

      this.message =
        'Cet identifiant est déjà utilisé.';

      return;

    }


    const membre = {

      nom:
        this.nouveauNom.trim(),

      role:
        this.nouveauRole,

      departement:
        this.nouveauDepartement.trim(),

      email:
        this.nouvelEmail.trim(),

      identifiant:
        this.nouvelIdentifiant.trim(),

      motDePasse:
        this.nouveauMotDePasse.trim()

    };


    if (this.modeModification) {

      this.membres[
        this.membreModifieIndex
      ] = membre;

    } else {

      this.membres.push(membre);

    }


    this.sauvegarderMembres();

    this.formulaireVisible = false;

    this.message = '';

  }


  supprimerMembre(membre: any) {

    if (membre.role === 'Admin') {

      this.message =
        'Le compte Admin ne peut pas être supprimé.';

      return;

    }


    const index =
      this.membres.indexOf(membre);


    if (index === -1) {

      return;

    }


    this.membres.splice(index, 1);

    this.sauvegarderMembres();

  }


  sauvegarderMembres() {

    localStorage.setItem(
      'membres',
      JSON.stringify(this.membres)
    );

  }


  fermerFormulaire() {

    this.formulaireVisible = false;

    this.message = '';

  }


  retourDashboard() {

    this.router.navigate(['/dashboard']);

  }

}
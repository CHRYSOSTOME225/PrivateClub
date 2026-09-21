import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-administration',
  imports: [FormsModule],
  templateUrl: './administration.html',
  styleUrl: './administration.css'
})
export class Administration {

  membres: any[] = [];

  recherche = '';

  formulaireVisible = false;

  modeModification = false;

  membreModifieId: number | null = null;

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
    private auth: Auth,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {

    if (this.auth.getRole() !== 'Admin') {

      this.router.navigate(['/dashboard']);

      return;

    }

    this.chargerMembres();

  }

  chargerMembres() {

    this.http
      .get<any[]>(
        'http://localhost:3000/api/utilisateurs'
      )
      .subscribe({

        next: (resultats) => {

          this.membres = resultats;

          console.log(
            'MEMBRES ADMINISTRATION :',
            this.membres
          );

          this.cdr.detectChanges();

        },

        error: (erreur) => {

          console.error(
            'ERREUR CHARGEMENT MEMBRES :',
            erreur
          );

          this.message =
            'Impossible de charger les membres.';

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

      ||

      membre.email
        .toLowerCase()
        .includes(texte)

    );

  }

  ouvrirAjout() {

    this.modeModification = false;

    this.membreModifieId = null;

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

    this.modeModification = true;

    this.membreModifieId = membre.id;

    this.nouveauNom =
      membre.nom;

    this.nouveauRole =
      membre.role;

    this.nouveauDepartement =
      membre.departement || '';

    this.nouvelEmail =
      membre.email;

    this.nouvelIdentifiant =
      membre.email;

    this.nouveauMotDePasse = '';

    this.afficherMotDePasse = false;

    this.message = '';

    this.formulaireVisible = true;

  }

  basculerMotDePasse() {

    this.afficherMotDePasse =
      !this.afficherMotDePasse;

  }

  enregistrerMembre() {

    if (
      this.nouveauNom.trim() === '' ||
      this.nouveauDepartement.trim() === '' ||
      this.nouvelEmail.trim() === '' ||
      this.nouveauMotDePasse.trim() === ''
    ) {

      this.message =
        'Veuillez remplir tous les champs.';

      return;

    }

    const donnees = {

      nom:
        this.nouveauNom.trim(),

      email:
        this.nouvelEmail.trim(),

      motDePasse:
        this.nouveauMotDePasse.trim(),

      role:
        this.nouveauRole,

      departement:
        this.nouveauDepartement.trim()

    };

    if (this.modeModification) {

      this.http
        .put(
          `http://localhost:3000/api/utilisateurs/${this.membreModifieId}`,
          donnees
        )
        .subscribe({

          next: () => {

            this.formulaireVisible = false;

            this.message = '';

            this.chargerMembres();

          },

          error: (erreur) => {

            console.error(erreur);

            this.message =
              'Erreur lors de la modification.';

          }

        });

    } else {

      this.http
        .post(
          'http://localhost:3000/api/utilisateurs',
          donnees
        )
        .subscribe({

          next: () => {

            this.formulaireVisible = false;

            this.message = '';

            this.chargerMembres();

          },

          error: (erreur) => {

            console.error(erreur);

            this.message =
              'Erreur lors de la création du membre.';

          }

        });

    }

  }

  supprimerMembre(membre: any) {

    if (membre.role === 'Admin') {

      this.message =
        'Le compte Admin ne peut pas être supprimé.';

      return;

    }

    const confirmation =
      confirm(
        `Voulez-vous supprimer ${membre.nom} ?`
      );

    if (!confirmation) {

      return;

    }

    this.http
      .delete(
        `http://localhost:3000/api/utilisateurs/${membre.id}`
      )
      .subscribe({

        next: () => {

          this.message = '';

          this.chargerMembres();

        },

        error: (erreur) => {

          console.error(erreur);

          this.message =
            'Erreur lors de la suppression.';

        }

      });

  }

  fermerFormulaire() {

    this.formulaireVisible = false;

    this.message = '';

  }

  retourDashboard() {

    this.router.navigate(
      ['/dashboard']
    );

  }

}
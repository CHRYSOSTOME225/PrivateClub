import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private connecte = false;

  private id = 0;

  private role = '';

  private nom = '';

  private apiUrl =
    'http://localhost:3000/api/connexion';


  constructor(private http: HttpClient) {

    const utilisateur =
      localStorage.getItem(
        'utilisateurConnecte'
      );

    if (utilisateur) {

      const donnees =
        JSON.parse(utilisateur);

      this.connecte =
        donnees.connecte;

      this.id =
        donnees.id;

      this.role =
        donnees.role;

      this.nom =
        donnees.nom;

    }

  }


  estConnecte() {

    return this.connecte;

  }


  connecter(
    email: string,
    motDePasse: string
  ): Observable<any> {

    return this.http.post<any>(
      this.apiUrl,
      {
        email: email,
        motDePasse: motDePasse
      }
    ).pipe(

      tap((reponse) => {

        this.connecte = true;

        this.id =
          reponse.utilisateur.id;

        this.nom =
          reponse.utilisateur.nom;

        this.role =
          reponse.utilisateur.role;


        // Enregistrer le JWT
        localStorage.setItem(
          'token',
          reponse.token
        );


        // Enregistrer les informations
        // de l'utilisateur
        localStorage.setItem(
          'utilisateurConnecte',
          JSON.stringify({

            connecte: true,

            id:
              reponse.utilisateur.id,

            nom:
              reponse.utilisateur.nom,

            email:
              reponse.utilisateur.email,

            role:
              reponse.utilisateur.role,

            departement:
              reponse.utilisateur.departement,

            poste:
              reponse.utilisateur.poste,

            telephone:
              reponse.utilisateur.telephone,

            photo:
              reponse.utilisateur.photo

          })
        );

      })

    );

  }


  deconnecter() {

    this.connecte = false;

    this.id = 0;

    this.nom = '';

    this.role = '';


    localStorage.removeItem(
      'utilisateurConnecte'
    );


    // Supprimer également le JWT
    localStorage.removeItem(
      'token'
    );

  }


  getId() {

    return this.id;

  }


  getRole() {

    return this.role;

  }


  getNom() {

    return this.nom;

  }

}
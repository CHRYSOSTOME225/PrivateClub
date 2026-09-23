

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl =
    'http://localhost:3000/api';


  constructor(
    private http: HttpClient
  ) {}


  // ===============================
  // CONNEXION
  // ===============================

  connexion(
    email: string,
    motDePasse: string
  ) {

    return this.http.post(
      `${this.apiUrl}/connexion`,
      {
        email,
        motDePasse
      }
    );

  }


  // ===============================
  // UTILISATEURS
  // ===============================

  getUtilisateurs() {

    return this.http.get(
      `${this.apiUrl}/utilisateurs`
    );

  }


  // ===============================
  // UTILISATEUR PAR ID
  // ===============================

  getUtilisateur(
    id: number
  ) {

    return this.http.get(
      `${this.apiUrl}/utilisateurs/${id}`
    );

  }


  // ===============================
  // CRÉER UN UTILISATEUR
  // ===============================

  creerUtilisateur(
    donnees: any
  ) {

    return this.http.post(
      `${this.apiUrl}/utilisateurs`,
      donnees
    );

  }


  // ===============================
  // MODIFIER UN UTILISATEUR
  // ===============================

  modifierUtilisateur(
    id: number,
    donnees: any
  ) {

    return this.http.put(
      `${this.apiUrl}/utilisateurs/${id}`,
      donnees
    );

  }


  // ===============================
  // SUPPRIMER UN UTILISATEUR
  // ===============================

  supprimerUtilisateur(
    id: number
  ) {

    return this.http.delete(
      `${this.apiUrl}/utilisateurs/${id}`
    );

  }


  // ===============================
  // ANNONCES
  // ===============================

  getAnnonces() {

    return this.http.get(
      `${this.apiUrl}/annonces`
    );

  }


  // ===============================
  // CRÉER UNE ANNONCE
  // ===============================

  creerAnnonce(
    donnees: {
      titre: string;
      contenu: string;
    }
  ) {

    return this.http.post(
      `${this.apiUrl}/annonces`,
      donnees
    );

  }


  // ===============================
  // SUPPRIMER UNE ANNONCE
  // ===============================

  supprimerAnnonce(
    id: number
  ) {

    return this.http.delete(
      `${this.apiUrl}/annonces/${id}`
    );

  }


  // ===============================
  // MESSAGES
  // ===============================

  getMessages(
    utilisateur1: number,
    utilisateur2: number
  ) {

    return this.http.get(
      `${this.apiUrl}/messages/${utilisateur1}/${utilisateur2}`
    );

  }


  getNombreMessages() {

  return this.http.get(
    `${this.apiUrl}/messages/compteur`
  );

}

  // ===============================
  // ENVOYER UN MESSAGE
  // ===============================

  envoyerMessage(
    expediteur_id: number,
    destinataire_id: number,
    contenu: string
  ) {

    return this.http.post(
      `${this.apiUrl}/messages`,
      {
        expediteur_id,
        destinataire_id,
        contenu
      }
    );

  }

}


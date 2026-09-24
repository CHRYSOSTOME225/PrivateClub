import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}


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


  getUtilisateurs() {

    return this.http.get(
      `${this.apiUrl}/utilisateurs`
    );

  }


  getUtilisateur(id: number) {

    return this.http.get(
      `${this.apiUrl}/utilisateurs/${id}`
    );

  }


  creerUtilisateur(donnees: any) {

    return this.http.post(
      `${this.apiUrl}/utilisateurs`,
      donnees
    );

  }


  modifierUtilisateur(
    id: number,
    donnees: any
  ) {

    return this.http.put(
      `${this.apiUrl}/utilisateurs/${id}`,
      donnees
    );

  }


  supprimerUtilisateur(id: number) {

    return this.http.delete(
      `${this.apiUrl}/utilisateurs/${id}`
    );

  }


  getAnnonces() {

    return this.http.get(
      `${this.apiUrl}/annonces`
    );

  }


  creerAnnonce(formulaire: FormData) {

    return this.http.post(
      `${this.apiUrl}/annonces`,
      formulaire
    );

  }


  supprimerAnnonce(id: number) {

    return this.http.delete(
      `${this.apiUrl}/annonces/${id}`
    );

  }


  // =====================================================
  // MESSAGERIE
  // =====================================================

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


  marquerMessagesLus(
    utilisateurId: number
  ) {

    return this.http.put(
      `${this.apiUrl}/messages/lu/${utilisateurId}`,
      {}
    );

  }


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


  envoyerMessageAvecFichier(
    expediteur_id: number,
    destinataire_id: number,
    contenu: string,
    fichier: File | null
  ) {

    const formulaire =
      new FormData();


    formulaire.append(
      'expediteur_id',
      String(expediteur_id)
    );


    formulaire.append(
      'destinataire_id',
      String(destinataire_id)
    );


    formulaire.append(
      'contenu',
      contenu
    );


    if (fichier) {

      formulaire.append(
        'fichier',
        fichier
      );

    }


    return this.http.post(
      `${this.apiUrl}/messages`,
      formulaire
    );

  }


  // =====================================================
  // PHOTO PROFIL
  // =====================================================

  uploadPhotoProfil(
    id: number,
    fichier: File
  ) {

    const formulaire =
      new FormData();


    formulaire.append(
      'photo',
      fichier
    );


    return this.http.post(
      `${this.apiUrl}/utilisateurs/${id}/photo`,
      formulaire
    );

  }

}
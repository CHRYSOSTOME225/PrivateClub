
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Connexion
  connexion(email: string, motDePasse: string) {
    return this.http.post(`${this.apiUrl}/connexion`, {
      email,
      motDePasse
    });
  }

  // Utilisateurs
  getUtilisateurs() {
    return this.http.get(`${this.apiUrl}/utilisateurs`);
  }

  
// Utilisateur par ID
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

supprimerUtilisateur(id: number) {
  return this.http.delete(
    `${this.apiUrl}/utilisateurs/${id}`
  );
}

// Modifier un utilisateur
modifierUtilisateur(
  id: number,
  donnees: any
) {
  return this.http.put(
    `${this.apiUrl}/utilisateurs/${id}`,
    donnees
  );
}



  // Annonces
  getAnnonces() {
    return this.http.get(`${this.apiUrl}/annonces`);
  }

  creerAnnonce(donnees: {
    titre: string;
    contenu: string;
    auteur_id: number;
  }) {
    return this.http.post(
      `${this.apiUrl}/annonces`,
      donnees
    );
  }

  supprimerAnnonce(id: number) {
    return this.http.delete(
      `${this.apiUrl}/annonces/${id}`
    );
  }

  // Messages
  getMessages(
    utilisateur1: number,
    utilisateur2: number
  ) {
    return this.http.get(
      `${this.apiUrl}/messages/${utilisateur1}/${utilisateur2}`
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

}
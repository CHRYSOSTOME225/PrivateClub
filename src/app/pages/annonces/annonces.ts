import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-annonces',
  imports: [FormsModule],
  templateUrl: './annonces.html',
  styleUrl: './annonces.css'
})
export class Annonces {

  roleUtilisateur = '';

  annonces: {
    titre: string;
    contenu: string;
    auteur: string;
    date: string;
  }[] = [
    {
      titre: 'Réunion du club',
      contenu: 'Une réunion est prévue vendredi à 18h.',
      auteur: 'Jean Kouadio',
      date: '18 septembre 2026'
    },
    {
      titre: 'Nouvelle activité',
      contenu: 'Une nouvelle activité sera bientôt disponible.',
      auteur: 'Marie Yao',
      date: '18 septembre 2026'
    }
  ];

  formulaireVisible = false;

  nouveauTitre = '';
  nouveauContenu = '';

  constructor(
  private router: Router,
  public auth: Auth
) {}

  ngOnInit() {

    this.roleUtilisateur = this.auth.getRole();

    const annoncesSauvegardees = localStorage.getItem('annonces');

    if (annoncesSauvegardees) {
      this.annonces = JSON.parse(annoncesSauvegardees);
    }

  }

  ouvrirFormulaire() {
    this.formulaireVisible = true;
  }

  publierAnnonce() {

    if (
      this.nouveauTitre.trim() === '' ||
      this.nouveauContenu.trim() === ''
    ) {
      return;
    }

    this.annonces.push({
      titre: this.nouveauTitre,
      contenu: this.nouveauContenu,
      auteur: this.auth.getNom(),
      date: '18 septembre 2026'
    });

    localStorage.setItem(
      'annonces',
      JSON.stringify(this.annonces)
    );

    this.nouveauTitre = '';
    this.nouveauContenu = '';
    this.formulaireVisible = false;

  }

  supprimerAnnonce(index: number) {

  this.annonces.splice(index, 1);

  localStorage.setItem(
    'annonces',
    JSON.stringify(this.annonces)
  );

}

  retourDashboard() {
    this.router.navigate(['/dashboard']);
  }

}
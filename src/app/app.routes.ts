import { Routes } from '@angular/router';

import { Connexion } from './pages/connexion/connexion';

import { Dashboard } from './pages/dashboard/dashboard';

import { Membres } from './pages/membres/membres';

import { Annonces } from './pages/annonces/annonces';

import { Messagerie } from './pages/messagerie/messagerie';

import { Profil } from './pages/profil/profil';

import { Administration } from './pages/administration/administration';

import { authGuard } from './guards/auth-guard';

import { adminGuard } from './guards/admin-guard-guard';


export const routes: Routes = [

  {
    path: '',
    component: Connexion
  },

  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  },

  {
    path: 'membres',
    component: Membres,
    canActivate: [authGuard]
  },

  {
    path: 'annonces',
    component: Annonces,
    canActivate: [authGuard]
  },

  {
    path: 'messagerie',
    component: Messagerie,
    canActivate: [authGuard]
  },

  {
    path: 'profil',
    component: Profil,
    canActivate: [authGuard]
  },

  {
    path: 'administration',
    component: Administration,
    canActivate: [authGuard, adminGuard]
  }

];
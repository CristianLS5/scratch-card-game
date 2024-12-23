import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => 
      import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'game',
    title: 'Scratch & Win',
    canActivate: [authGuard],
    loadComponent: () => 
      import('./components/scratch-game/scratch-game.component')
        .then(m => m.ScratchGameComponent)
  }
];

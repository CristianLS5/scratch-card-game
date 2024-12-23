import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => 
      import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'game',
    title: 'Scratch & Win',
    loadComponent: () => 
      import('./components/scratch-game/scratch-game.component')
        .then(m => m.ScratchGameComponent)
  }
];

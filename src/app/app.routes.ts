import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tickets' },
  {
    path: 'tickets',
    loadChildren: () => import('./features/tickets/tickets.routes').then((m) => m.ticketsRoutes),
  },
];

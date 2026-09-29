import { Routes } from '@angular/router';
import { TicketsShellComponent } from './pages/tickets-shell/tickets-shell.component';
import { TicketsPlaceholderComponent } from './pages/tickets-placeholder/tickets-placeholder.component';
import { TicketDetailStore } from './services/ticket-detail.store';
import { TicketStatusStore } from './services/ticket-status.store';
import { TicketsStore } from './services/tickets.store';
import { TicketsUrlSync } from './services/tickets-url-sync.service';

export const ticketsRoutes: Routes = [
  {
    path: '',
    component: TicketsShellComponent,
    providers: [TicketsUrlSync, TicketsStore, TicketStatusStore],
    children: [
      { path: '', pathMatch: 'full', component: TicketsPlaceholderComponent },
      {
        path: ':ticketId',
        providers: [TicketDetailStore],
        loadComponent: () =>
          import('./pages/ticket-detail/ticket-detail.component').then(
            (m) => m.TicketDetailComponent,
          ),
      },
    ],
  },
];

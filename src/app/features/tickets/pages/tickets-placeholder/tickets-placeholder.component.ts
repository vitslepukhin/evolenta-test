import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Shown at the empty `/tickets` route before a ticket is selected. */
@Component({
  selector: 'app-tickets-placeholder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tickets-placeholder.component.html',
  styleUrl: './tickets-placeholder.component.scss',
})
export class TicketsPlaceholderComponent {}

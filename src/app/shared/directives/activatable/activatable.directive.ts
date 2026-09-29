import { Directive, output } from '@angular/core';

/**
 * Host directive: standard a11y "activation" behavior for custom
 * interactive elements that aren't native `<button>`/`<a>` (e.g.
 * `role="option"`, `role="menuitem"`) — click, `Enter`, or `Space` all
 * emit `activated`. `Space` additionally prevents the default page
 * scroll. Composed via `hostDirectives`, e.g. `TicketListItemComponent`.
 */
@Directive({
  selector: '[appActivatable]',
  host: {
    '(click)': 'onActivate()',
    '(keydown.enter)': 'onActivate()',
    '(keydown.space)': 'onSpace($event)',
  },
})
export class ActivatableDirective {
  readonly activated = output<void>();

  onActivate(): void {
    this.activated.emit();
  }

  onSpace(event: Event): void {
    event.preventDefault();
    this.onActivate();
  }
}

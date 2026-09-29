import { Directive, ElementRef, afterNextRender, inject } from '@angular/core';

const OPTION_SELECTOR = '[role="option"]';

/**
 * Host directive: keyboard navigation (↑/↓/Home/End) across children
 * matching `[role="option"]`, moving `tabindex`/focus between them.
 * Composed via `hostDirectives` in `TicketListComponent`.
 */
@Directive({
  selector: '[appRovingTabindex]',
  host: {
    '(keydown)': 'onKeydown($event)',
  },
})
export class RovingTabindexDirective {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private activeIndex = 0;

  constructor() {
    afterNextRender(() => this.syncTabindex());
  }

  onKeydown(event: KeyboardEvent): void {
    const items = this.getItems();
    if (items.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusItem(items, Math.min(this.activeIndex + 1, items.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusItem(items, Math.max(this.activeIndex - 1, 0));
        break;
      case 'Home':
        event.preventDefault();
        this.focusItem(items, 0);
        break;
      case 'End':
        event.preventDefault();
        this.focusItem(items, items.length - 1);
        break;
    }
  }

  /** Re-applies roving tabindex, e.g. after the list re-renders with new items. */
  syncTabindex(): void {
    const items = this.getItems();
    if (items.length === 0) return;

    this.activeIndex = Math.min(this.activeIndex, items.length - 1);
    items.forEach((item, index) => {
      item.setAttribute('tabindex', index === this.activeIndex ? '0' : '-1');
    });
  }

  private getItems(): HTMLElement[] {
    const host = this.elementRef.nativeElement as HTMLElement;
    return Array.from(host.querySelectorAll<HTMLElement>(OPTION_SELECTOR));
  }

  private focusItem(items: HTMLElement[], index: number): void {
    items.forEach((item, i) => item.setAttribute('tabindex', i === index ? '0' : '-1'));
    items[index].focus();
    this.activeIndex = index;
  }
}

import { TestBed } from '@angular/core/testing';
import { TicketStatus } from '../../models/ticket-status.model';
import { StatusSelectComponent } from './status-select.component';

describe('StatusSelectComponent', () => {
  function createFixture(status: TicketStatus = 'open') {
    TestBed.configureTestingModule({ imports: [StatusSelectComponent] });
    const fixture = TestBed.createComponent(StatusSelectComponent);
    fixture.componentRef.setInput('status', status);
    return fixture;
  }

  function selectElement(fixture: { nativeElement: HTMLElement }): HTMLSelectElement {
    const select = fixture.nativeElement.querySelector('select');
    if (!select) throw new Error('select not found');
    return select;
  }

  it('shows the current status label and hides the native control', async () => {
    const fixture = createFixture('open');
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('В работе');
    expect(selectElement(fixture).classList.contains('native')).toBe(true);
    expect(host.querySelector('[role="listbox"]')).toBeNull();
  });

  it('emits statusChange when a different option is chosen', async () => {
    const fixture = createFixture('open');
    await fixture.whenStable();

    let emitted: TicketStatus | null = null;
    fixture.componentInstance.statusChange.subscribe((s) => (emitted = s));

    const select = selectElement(fixture);
    select.value = 'resolved';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(emitted).toBe('resolved');
  });

  it('does not emit statusChange when the value stays the same', async () => {
    const fixture = createFixture('open');
    await fixture.whenStable();

    let emitted = false;
    fixture.componentInstance.statusChange.subscribe(() => (emitted = true));

    const select = selectElement(fixture);
    select.value = 'open';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(emitted).toBe(false);
  });

  it('disables the native select when disabled', async () => {
    const fixture = createFixture();
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();

    expect(selectElement(fixture).disabled).toBe(true);
  });
});

import { TestBed } from '@angular/core/testing';
import { StatusBadgeComponent, StatusBadgeType } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  function createFixture(label: string, type: StatusBadgeType) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [StatusBadgeComponent] });
    const fixture = TestBed.createComponent(StatusBadgeComponent);
    fixture.componentRef.setInput('label', label);
    fixture.componentRef.setInput('type', type);
    return fixture;
  }

  it('renders the label it is given', async () => {
    const fixture = createFixture('В работе', 'progress' as StatusBadgeType);
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent?.trim()).toBe('В работе');
  });

  it('applies the type class it is given', async () => {
    const fixture = createFixture('Решено', 'success' as StatusBadgeType);
    await fixture.whenStable();

    const span = (fixture.nativeElement as HTMLElement).querySelector('.badge');
    expect(span?.classList.contains('success')).toBe(true);
  });
});

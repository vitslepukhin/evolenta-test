import { TestBed } from '@angular/core/testing';
import { LoadingIndicatorComponent } from './loading-indicator.component';

describe('LoadingIndicatorComponent', () => {
  function createFixture() {
    TestBed.configureTestingModule({ imports: [LoadingIndicatorComponent] });
    return TestBed.createComponent(LoadingIndicatorComponent);
  }

  it('renders the default label with a status live region', async () => {
    const fixture = createFixture();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement.querySelector('[role="status"]');
    expect(el).toBeTruthy();
    expect(el.textContent).toContain('Загрузка…');
  });

  it('renders a custom label', async () => {
    const fixture = createFixture();
    fixture.componentRef.setInput('label', 'Секунду…');
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Секунду…');
  });
});

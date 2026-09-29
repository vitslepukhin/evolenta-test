import { TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  function createFixture() {
    TestBed.configureTestingModule({ imports: [EmptyStateComponent] });
    return TestBed.createComponent(EmptyStateComponent);
  }

  it('renders the default message', async () => {
    const fixture = createFixture();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Ничего не найдено');
  });

  it('renders a custom message', async () => {
    const fixture = createFixture();
    fixture.componentRef.setInput('message', 'Обращения не найдены');
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Обращения не найдены');
  });
});

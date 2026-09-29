import { TestBed } from '@angular/core/testing';
import { ErrorStateComponent } from './error-state.component';

describe('ErrorStateComponent', () => {
  it('renders the message and default retry label', async () => {
    TestBed.configureTestingModule({ imports: [ErrorStateComponent] });
    const fixture = TestBed.createComponent(ErrorStateComponent);
    fixture.componentRef.setInput('message', 'Что-то пошло не так');
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.message')?.textContent?.trim()).toBe(
      'Что-то пошло не так',
    );
    expect(el.querySelector('button')?.textContent?.trim()).toBe('Повторить');
  });

  it('emits retry when the button is clicked', async () => {
    TestBed.configureTestingModule({ imports: [ErrorStateComponent] });
    const fixture = TestBed.createComponent(ErrorStateComponent);
    await fixture.whenStable();

    let emitted = false;
    fixture.componentInstance.retry.subscribe(() => (emitted = true));

    (fixture.nativeElement as HTMLElement).querySelector('button')?.click();
    await fixture.whenStable();

    expect(emitted).toBe(true);
  });
});

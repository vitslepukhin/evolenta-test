import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatableDirective } from './activatable.directive';

@Component({
  selector: 'app-activatable-test-host',
  hostDirectives: [{ directive: ActivatableDirective, outputs: ['activated'] }],
  template: ``,
})
class TestHostComponent {}

describe('ActivatableDirective', () => {
  function createHost() {
    TestBed.configureTestingModule({ imports: [TestHostComponent] });
    const fixture = TestBed.createComponent(TestHostComponent);
    const directive = fixture.debugElement.injector.get(ActivatableDirective);
    return { fixture, directive };
  }

  it('emits activated on click', async () => {
    const { fixture, directive } = createHost();
    await fixture.whenStable();

    let count = 0;
    directive.activated.subscribe(() => count++);

    (fixture.nativeElement as HTMLElement).dispatchEvent(new Event('click', { bubbles: true }));

    expect(count).toBe(1);
  });

  it('emits activated on Enter', async () => {
    const { fixture, directive } = createHost();
    await fixture.whenStable();

    let count = 0;
    directive.activated.subscribe(() => count++);

    (fixture.nativeElement as HTMLElement).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );

    expect(count).toBe(1);
  });

  it('emits activated on Space and prevents the default page scroll', async () => {
    const { fixture, directive } = createHost();
    await fixture.whenStable();

    let count = 0;
    directive.activated.subscribe(() => count++);

    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    (fixture.nativeElement as HTMLElement).dispatchEvent(event);

    expect(count).toBe(1);
    expect(event.defaultPrevented).toBe(true);
  });
});

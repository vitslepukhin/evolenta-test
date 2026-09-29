import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RovingTabindexDirective } from './roving-tabindex.directive';

@Component({
  selector: 'app-roving-test-host',
  hostDirectives: [RovingTabindexDirective],
  template: `
    <div role="option">One</div>
    <div role="option">Two</div>
    <div role="option">Three</div>
  `,
})
class TestHostComponent {}

describe('RovingTabindexDirective', () => {
  async function createHost() {
    TestBed.configureTestingModule({ imports: [TestHostComponent] });
    const fixture = TestBed.createComponent(TestHostComponent);
    await fixture.whenStable();
    const items = Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll('[role="option"]'),
    );
    return { fixture, items };
  }

  function press(host: HTMLElement, key: string) {
    host.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  }

  it('sets the first option as the only tabbable one initially', async () => {
    const { items } = await createHost();
    expect(items.map((item) => item.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
  });

  it('moves the roving tabindex forward on ArrowDown', async () => {
    const { fixture, items } = await createHost();
    press(fixture.nativeElement, 'ArrowDown');

    expect(items.map((item) => item.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
  });

  it('does not go past the last item on ArrowDown', async () => {
    const { fixture, items } = await createHost();
    press(fixture.nativeElement, 'ArrowDown');
    press(fixture.nativeElement, 'ArrowDown');
    press(fixture.nativeElement, 'ArrowDown');

    expect(items.map((item) => item.getAttribute('tabindex'))).toEqual(['-1', '-1', '0']);
  });

  it('jumps to the first item on Home and the last on End', async () => {
    const { fixture, items } = await createHost();
    press(fixture.nativeElement, 'End');
    expect(items.map((item) => item.getAttribute('tabindex'))).toEqual(['-1', '-1', '0']);

    press(fixture.nativeElement, 'Home');
    expect(items.map((item) => item.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
  });
});

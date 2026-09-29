import { TestBed } from '@angular/core/testing';
import { ReplyFormComponent } from './reply-form.component';

describe('ReplyFormComponent', () => {
  function createFixture() {
    TestBed.configureTestingModule({ imports: [ReplyFormComponent] });
    return TestBed.createComponent(ReplyFormComponent);
  }

  it('disables the submit button while the text is empty or whitespace-only', async () => {
    const fixture = createFixture();
    await fixture.whenStable();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBe(true);

    fixture.componentRef.setInput('text', '   ');
    await fixture.whenStable();
    expect(button.disabled).toBe(true);
  });

  it('enables the submit button once there is non-whitespace text', async () => {
    const fixture = createFixture();
    fixture.componentRef.setInput('text', 'hello');
    await fixture.whenStable();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBe(false);
  });

  it('emits replySubmit with the trimmed text and does not clear the field itself', async () => {
    const fixture = createFixture();
    fixture.componentRef.setInput('text', '  hello world  ');
    await fixture.whenStable();

    let emitted: string | null = null;
    fixture.componentInstance.replySubmit.subscribe((value) => (emitted = value));

    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(emitted).toBe('hello world');
    expect(fixture.componentInstance.text()).toBe('  hello world  ');
  });

  it('disables the textarea and submit button while pending', async () => {
    const fixture = createFixture();
    fixture.componentRef.setInput('text', 'hello');
    fixture.componentRef.setInput('pending', true);
    await fixture.whenStable();

    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(textarea.disabled).toBe(true);
    expect(button.disabled).toBe(true);
  });

  it('updates the text model as the user types', async () => {
    const fixture = createFixture();
    await fixture.whenStable();

    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    textarea.value = 'typed value';
    textarea.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.componentInstance.text()).toBe('typed value');
  });
});

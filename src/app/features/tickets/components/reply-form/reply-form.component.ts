import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';

const MAX_REPLY_LENGTH = 5000;

@Component({
  selector: 'app-reply-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reply-form.component.html',
  styleUrl: './reply-form.component.scss',
})
export class ReplyFormComponent {
  readonly text = model('');
  readonly pending = input(false);

  readonly replySubmit = output<string>();

  protected readonly maxLength = MAX_REPLY_LENGTH;
  protected readonly disabled = computed(() => !this.text().trim() || this.pending());

  protected onInput(event: Event): void {
    this.text.set((event.target as HTMLTextAreaElement).value);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    const value = this.text().trim();
    if (!value) return;
    this.replySubmit.emit(value);
  }
}

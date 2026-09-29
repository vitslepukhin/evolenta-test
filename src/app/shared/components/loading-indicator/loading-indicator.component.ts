import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-indicator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loading-indicator.component.html',
  styleUrl: './loading-indicator.component.scss',
})
export class LoadingIndicatorComponent {
  readonly label = input('Загрузка…');
}

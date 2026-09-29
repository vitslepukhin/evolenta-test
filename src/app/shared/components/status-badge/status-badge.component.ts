import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export const STATUS_BADGE_TYPES = ['info', 'progress', 'waiting', 'success'] as const;
export type StatusBadgeType = (typeof STATUS_BADGE_TYPES)[number];

@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
})
export class StatusBadgeComponent {
  readonly label = input.required<string>();
  readonly type = input.required<StatusBadgeType>();
}

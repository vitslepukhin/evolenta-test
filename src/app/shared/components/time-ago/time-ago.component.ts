import { formatDate } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  LOCALE_ID,
} from '@angular/core';
import { DateParser } from '../../services/date-parser/date-parser';
import { TickerService } from '../../services/ticker/ticker.service';
import { UserTimeZone } from '../../services/user-time-zone/user-time-zone.service';
import { relativeTime } from '../../utils/relative-time';

const ABSOLUTE_DATE_FORMAT = `d MMMM y 'г.', HH:mm`;

@Component({
  selector: 'app-time-ago',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './time-ago.component.html',
  styleUrl: './time-ago.component.scss',
})
export class TimeAgoComponent {
  readonly date = input.required<string>();

  private readonly dateParser = inject(DateParser);
  private readonly userTimeZone = inject(UserTimeZone);
  private readonly locale = inject(LOCALE_ID);
  private readonly ticker = inject(TickerService);

  private readonly parsedDate = computed(() => this.dateParser.parse(this.date()));

  readonly label = computed(() => {
    this.ticker.tick();
    return relativeTime(this.parsedDate());
  });

  readonly absoluteLabel = computed(() => {
    const date = this.parsedDate();
    if (Number.isNaN(date.getTime())) return '';
    return formatDate(
      date,
      ABSOLUTE_DATE_FORMAT,
      this.locale,
      this.userTimeZone.timezoneOffset(date),
    );
  });

  readonly isoDatetime = computed(() => this.parsedDate().toISOString());
}

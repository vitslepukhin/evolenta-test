import { Injectable } from '@angular/core';

/**
 * Единственная точка знания о том, В КАКОМ ФОРМАТЕ бэкенд присылает даты.
 * Всё остальное (`relativeTime`, `formatDate`, `TimeAgoComponent`)
 * работает только с уже распарсенным `Date` и понятия
 * не имеет о конкретном строковом формате бэка.
 *
 * Если бэкенд сменит формат (например, начнёт отдавать честный ISO с `Z`),
 * нужно поменять ТОЛЬКО провайдер этого токена (`{ provide: DateParser, useClass: ... }`
 * в `app.config.ts`) — остальной код трогать не придётся.
 */
@Injectable({ providedIn: 'root', useFactory: () => new NaiveUtcDateParser() })
export abstract class DateParser {
  abstract parse(value: string): Date;
}

const HAS_TIMEZONE_DESIGNATOR = /(Z|[+-]\d{2}:?\d{2})$/;

/**
 * Текущий формат бэка: naive UTC-строка без указания пояса и с пробелом
 * вместо `T`, например `"2026-09-28 12:30:28.612"`. Без нормализации
 * `new Date(...)` парсит такую строку как ЛОКАЛЬНОЕ время машины (а не UTC),
 * что и давало систематическую ошибку в relative-time на величину TZ-offset.
 */
export class NaiveUtcDateParser implements DateParser {
  parse(value: string): Date {
    const normalized = HAS_TIMEZONE_DESIGNATOR.test(value)
      ? value
      : `${value.trim().replace(' ', 'T')}Z`;
    return new Date(normalized);
  }
}

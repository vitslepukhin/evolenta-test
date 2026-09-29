import { forwardRef, Injectable } from '@angular/core';

/**
 * Откуда брать часовой пояс пользователя для `formatDate`.
 * `formatDate` принимает смещение вида `+0400`, а не IANA-имя.
 *
 * Чтобы подменить пояс (например, в тестах или на фиксированную зону),
 * меняется только провайдер этого токена
 * (`{ provide: UserTimeZone, useClass: ... }` в `app.config.ts`).
 */
@Injectable({ providedIn: 'root', useClass: forwardRef(() => LocalUserTimeZone) })
export abstract class UserTimeZone {
  abstract timezoneOffset(date: Date): string;
}

@Injectable()
/** Смещение локальной зоны машины для конкретной даты, например `+0400`. */
export class LocalUserTimeZone implements UserTimeZone {
  timezoneOffset(date: Date): string {
    const offsetMinutes = -date.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const abs = Math.abs(offsetMinutes);
    const hours = String(Math.floor(abs / 60)).padStart(2, '0');
    const minutes = String(abs % 60).padStart(2, '0');
    return `${sign}${hours}${minutes}`;
  }
}

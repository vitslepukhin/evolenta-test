import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';

const TICK_INTERVAL_MS = 60_000;

@Injectable({ providedIn: 'root' })
export class TickerService {
  readonly tick = toSignal(timer(TICK_INTERVAL_MS, TICK_INTERVAL_MS), { initialValue: -1 });
}

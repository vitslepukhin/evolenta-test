import { TestBed } from '@angular/core/testing';
import { MessageEntity } from '../../models/message.model';
import { MessageListComponent } from './message-list.component';

describe('MessageListComponent', () => {
  function createFixture(messages: MessageEntity[]) {
    TestBed.configureTestingModule({ imports: [MessageListComponent] });
    const fixture = TestBed.createComponent(MessageListComponent);
    fixture.componentRef.setInput('messages', messages);
    return fixture;
  }

  it('renders one app-message-item per message, in order', async () => {
    const messages: MessageEntity[] = [
      {
        id: 'm1',
        ticketId: 't1',
        author: 'Jane',
        role: 'customer',
        text: 'First',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'm2',
        ticketId: 't1',
        author: 'Agent Smith',
        role: 'agent',
        text: 'Second',
        createdAt: '2026-01-01T00:01:00.000Z',
      },
    ];
    const fixture = createFixture(messages);
    await fixture.whenStable();

    const items = (fixture.nativeElement as HTMLElement).querySelectorAll('app-message-item');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('First');
    expect(items[1].textContent).toContain('Second');
  });

  it('renders an empty state message when there are no messages', async () => {
    const fixture = createFixture([]);
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Сообщений пока нет');
  });
});

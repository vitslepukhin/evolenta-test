import { TestBed } from '@angular/core/testing';
import { MessageEntity } from '../../models/message.model';
import { MessageItemComponent } from './message-item.component';

describe('MessageItemComponent', () => {
  const baseMessage: MessageEntity = {
    id: 'm1',
    ticketId: 't1',
    author: 'Jane Doe',
    role: 'customer',
    text: 'Hello there',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  function createFixture(message: MessageEntity) {
    TestBed.configureTestingModule({ imports: [MessageItemComponent] });
    const fixture = TestBed.createComponent(MessageItemComponent);
    fixture.componentRef.setInput('message', message);
    return fixture;
  }

  it('renders the author and text', async () => {
    const fixture = createFixture(baseMessage);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Jane Doe');
    expect(el.textContent).toContain('Hello there');
  });

  it('applies the customer modifier class for customer messages', async () => {
    const fixture = createFixture(baseMessage);
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).classList.contains('customer')).toBe(true);
  });

  it('applies the agent modifier class for agent messages', async () => {
    const fixture = createFixture({ ...baseMessage, role: 'agent' });
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).classList.contains('agent')).toBe(true);
  });
});

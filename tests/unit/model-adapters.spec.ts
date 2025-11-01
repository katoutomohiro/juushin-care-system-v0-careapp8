import { describe, it, expect } from 'vitest';
import { journalToUnified, unifiedToJournal, unifiedToDexieDiary, dexieDiaryToUnified } from '../../lib/model-adapters';
import type { JournalEntry } from '../../schemas/journal';
import type { DiaryEntry } from '../../lib/db';

describe('model-adapters', () => {
  it('journal <-> unified round-trip keeps core fields', () => {
    const j: JournalEntry = {
      title: 'タイトル',
      content: '内容',
      category: 'observation',
      timestamp: '2025-11-01T09:00:00.000Z',
      tags: ['tag1', 'tag2'],
    };

    const u = journalToUnified(j, { id: 'id1', userId: 'u1', serviceId: 's1' });
    expect(u.id).toBe('id1');
    expect(u.userId).toBe('u1');
    expect(u.serviceId).toBe('s1');
    expect(u.title).toBe(j.title);
    expect(u.content).toBe(j.content);
    expect(u.tags).toEqual(j.tags);
    expect(u.date.slice(0, 10)).toBe('2025-11-01');

    const back = unifiedToJournal(u);
    expect(back.title).toBe(j.title);
    expect(back.content).toBe(j.content);
    expect(back.category).toBe('observation');
    expect(back.tags).toEqual(j.tags);
  });

  it('dexie diary <-> unified round-trip keeps vitals and photos', () => {
    const d: DiaryEntry = {
      id: 'd1',
      date: '2025-11-01',
      records: [
        {
          time: '09:00',
          heartRate: 88,
          temperature: 36.7,
          oxygenSaturation: 98,
          notes: '元気',
          pee: true,
          poo: false,
        },
      ],
      photos: ['blob://1'],
      editHistory: [],
      createdAt: '2025-11-01T00:00:00.000Z',
      updatedAt: '2025-11-01T00:00:00.000Z',
    };

    const u = dexieDiaryToUnified(d, { userId: 'u1', serviceId: 's1' });
    expect(u.id).toBe('d1');
    expect(u.records[0]?.vitals?.heartRate).toBe(88);
    expect(u.attachments.length).toBe(1);

    const back = unifiedToDexieDiary(u);
    expect(back.id).toBe('d1');
    expect(back.records[0]?.heartRate).toBe(88);
    expect(back.photos?.[0]).toBe('blob://1');
  });
});

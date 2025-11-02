import Dexie, { Table } from 'dexie';
import type { TodoItem } from '../schemas/todo';
import type { Medication } from '../schemas/medication';

export interface MedicalRecord {
  time: string;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  seizureType?: string;
  medsAt?: string[];
  notes?: string;
  pee?: boolean;
  poo?: boolean;
}

export interface EditHistory {
  timestamp: string;
  editor: string; // 将来的にユーザーIDに変更
  changes: string;
}

export interface DiaryEntry {
  id: string;
  date: string;
  records: MedicalRecord[];
  photos?: string[]; // ObjectURLまたはbase64
  editHistory?: EditHistory[];
  encryptedData?: string; // 暗号化されたペイロード（将来使用）
  createdAt: string;
  updatedAt: string;
}

export class DiaryDatabase extends Dexie {
  diaryEntries!: Table<DiaryEntry, string>;
  todos!: Table<TodoItem, string>;

  constructor() {
    super('DiaryDatabase');
    // v1: diaryEntries only
    this.version(1).stores({
      diaryEntries: 'id, date, createdAt, updatedAt'
    });
    // v2: add todos table
    this.version(2).stores({
      diaryEntries: 'id, date, createdAt, updatedAt',
      todos: 'id, completed, dueDate, priority, createdAt, updatedAt'
    });
  }
}

export const db = new DiaryDatabase();

'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { toInputDate } from '@/lib/date';
import { db } from '../../lib/db';
import type { TodoItem, TodoPriority } from '../../schemas/todo';

function nowISO() {
  return new Date().toISOString();
}

export default function TodosPage() {
  const [items, setItems] = useState<TodoItem[]>([]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TodoPriority>('medium');
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const canCreate = useMemo(() => title.trim().length > 0, [title]);

  async function load() {
    setLoading(true);
    const rows = await db.table('todos').orderBy('createdAt').reverse().toArray() as TodoItem[];
    setItems(rows);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreate) return;
    setCreating(true);
    const item: TodoItem = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      dueDate: dueDate || undefined,
      priority,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    await db.table('todos').put(item);
    setTitle('');
    setDueDate('');
    setPriority('medium');
    setCreating(false);
    load();
  }

  async function toggleCompleted(item: TodoItem) {
    await db.table('todos').update(item.id, { completed: !item.completed, updatedAt: nowISO() });
    load();
  }

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">ToDo リスト</h1>

      <form onSubmit={addTodo} className="flex flex-wrap items-end gap-3 bg-gray-50 p-4 rounded border">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-sm text-gray-600 mb-1" htmlFor="todo-title">タイトル</label>
          <input id="todo-title" className="w-full border rounded px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例：月次レポートの確認" required />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1" htmlFor="todo-due">期限</label>
          <input
            id="todo-due"
            type="date"
            className="border rounded px-3 py-2"
            value={toInputDate(dueDate)}
            onChange={(e) => setDueDate(e.currentTarget.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1" htmlFor="todo-priority">優先度</label>
          <select id="todo-priority" className="border rounded px-3 py-2" value={priority} onChange={(e) => setPriority(e.target.value as TodoPriority)}>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>
        <button type="submit" disabled={!canCreate || creating} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded disabled:opacity-50">
          {creating ? '追加中…' : '追加'}
        </button>
      </form>

      <div className="bg-white border rounded divide-y">
        {loading ? (
          <div className="p-4 text-gray-500">読み込み中…</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-gray-500">ToDoはまだありません。上のフォームから追加してください。</div>
        ) : (
          items.map((it) => (
            <label key={it.id} className="flex items-center gap-3 p-4">
              <input
                type="checkbox"
                checked={it.completed}
                onChange={() => toggleCompleted(it)}
                aria-label={`完了: ${it.title}`}
              />
              <div className="flex-1">
                <div className={`font-medium ${it.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>{it.title}</div>
                <div className="text-xs text-gray-500">
                  期限: {it.dueDate || '—'} / 優先度: {it.priority}
                </div>
              </div>
            </label>
          ))
        )}
      </div>
    </div>
  );
}

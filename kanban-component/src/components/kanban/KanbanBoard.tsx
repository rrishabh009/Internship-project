import React, { useMemo, useState } from 'react';
import type { KanbanTask, KanbanColumn } from '../../types/kanban.types';
import { Modal } from '../primitives/Modal';
import { KanbanColumn as Column } from './KanbanColumn';

interface Props {
  columns: KanbanColumn[];
  tasks: Record<string, KanbanTask>;
  onTaskMove: (taskId: string, fromColumn: string, toColumn: string, newIndex: number) => void;
  onTaskCreate: (columnId: string, task: KanbanTask) => void;
  onTaskUpdate: (taskId: string, updates: Partial<KanbanTask>) => void;
  onTaskDelete: (taskId: string) => void;
}

type PriorityFilter = KanbanTask['priority'] | 'all';

export const KanbanBoard: React.FC<Props> = ({ columns, tasks, onTaskMove, onTaskCreate, onTaskUpdate, onTaskDelete }) => {
  const [editing, setEditing] = useState<KanbanTask | null>(null);
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState<PriorityFilter>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [assigneeFilter, setAssigneeFilter] = useState<'all' | string>('all');
  const [tagFilter, setTagFilter] = useState<'all' | string>('all');

  const tasksByColumn = useMemo(() => {
    const byId: Record<string, KanbanTask[]> = {};
    for (const c of columns) {
      const arr = c.taskIds.map((id) => tasks[id]).filter(Boolean) as KanbanTask[];
      const filtered = arr.filter((t) =>
        (!query || t.title.toLowerCase().includes(query.toLowerCase())) &&
        (priority === 'all' || t.priority === priority) &&
        (assigneeFilter === 'all' || t.assignee === assigneeFilter) &&
        (tagFilter === 'all' || (t.tags ?? []).includes(tagFilter))
      );
      byId[c.id] = filtered;
    }
    return byId;
  }, [columns, tasks, query, priority, assigneeFilter, tagFilter]);

  const startDrag = (taskId: string, fromColumn: string) => {
    // store source column id so drop knows origin
    const w = window as Window & { _kanbanDataTransfer?: { draggedId?: string; fromColumn?: string } };
    const dt = w._kanbanDataTransfer ?? (w._kanbanDataTransfer = {});
    dt.draggedId = taskId; dt.fromColumn = fromColumn;
  };

  const handleDropMove = (taskId: string, fromColumn: string, toColumn: string, index: number) => {
    onTaskMove(taskId, fromColumn, toColumn, index);
  };

  const handleAddTask = (columnId: string) => {
    const id = `task-${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date();
    const task: KanbanTask = { id, title: 'New Task', status: columnId, createdAt: now };
    onTaskCreate(columnId, task);
    setEditing(task);
  };

  const assignees = useMemo(() => Array.from(new Set(Object.values(tasks).map(t => t.assignee).filter(Boolean) as string[])), [tasks]);
  const tags = useMemo(() => Array.from(new Set(Object.values(tasks).flatMap(t => t.tags ?? []))), [tasks]);

  return (
    <div className="flex min-h-screen lg:h-screen flex-col gap-2 px-3 py-2 lg:py-3 w-full">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <input aria-label="Search tasks" placeholder="Search tasks" value={query} onChange={(e) => setQuery(e.currentTarget.value)} className="w-64 rounded-lg border border-neutral-300 px-3 py-2" />
        <select aria-label="Filter priority" value={priority} onChange={(e) => setPriority(e.currentTarget.value as PriorityFilter)} className="rounded-lg border border-neutral-300 px-3 py-2">
          <option value="all">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <select aria-label="Filter assignee" value={assigneeFilter} onChange={(e)=> setAssigneeFilter(e.currentTarget.value as 'all' | string)} className="rounded-lg border border-neutral-300 px-3 py-2">
          <option value="all">All assignees</option>
          {assignees.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select aria-label="Filter tag" value={tagFilter} onChange={(e)=> setTagFilter(e.currentTarget.value as 'all' | string)} className="rounded-lg border border-neutral-300 px-3 py-2">
          <option value="all">All tags</option>
          {tags.map(t => <option key={t} value={t}>#{t}</option>)}
        </select>
        {selected.size > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-neutral-600">{selected.size} selected</span>
            <select aria-label="Move selected to" className="rounded border px-2 py-1" onChange={(e) => {
              const to = e.currentTarget.value; if (!to) return; let i = 0; selected.forEach((id) => { const from = (Object.values(tasks).find(t => t.id===id)?.status) as string; onTaskMove(id, from, to, columns.find(c=>c.id===to)?.taskIds.length ?? 0 + i++); }); e.currentTarget.selectedIndex = 0; }}>
              <option value="">Move to…</option>
              {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <button className="rounded bg-red-600 px-3 py-1.5 text-white" onClick={() => { selected.forEach(onTaskDelete); setSelected(new Set()); }}>Delete</button>
            <button className="rounded border px-3 py-1.5" onClick={() => setSelected(new Set())}>Clear</button>
          </div>
        )}
      </div>
      <div className="flex grow gap-3 flex-col md:flex-row md:flex-wrap md:overflow-y-auto md:overflow-x-hidden lg:flex-nowrap lg:overflow-x-auto lg:snap-x lg:snap-mandatory lg:scroll-smooth">
        {columns.map((c) => (
          <Column
            key={c.id}
            column={c}
            tasks={tasksByColumn[c.id]}
            onAddTask={handleAddTask}
            onEditTask={setEditing}
            onDeleteTask={onTaskDelete}
            onMove={(taskId, from, to, idx) => handleDropMove(taskId, from, to, idx)}
            onDragStart={(id, from) => startDrag(id, from)}
            selectedIds={selected}
            onToggleSelect={(id) => setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; })}
          />
        ))}
      </div>

      <Modal open={!!editing} title="Edit Task" onClose={() => setEditing(null)}>
        {editing && (
          <form
            className="grid gap-3"
            onSubmit={(e) => { e.preventDefault(); setEditing(null); }}
          >
            <label className="grid gap-1">
              <span className="text-xs font-medium">Title</span>
              <input
                value={editing.title}
                onChange={(e) => { const v = e.currentTarget.value; setEditing((t) => (t ? { ...t, title: v } : t)); onTaskUpdate(editing.id, { title: v }); }}
                className="rounded-lg border border-neutral-300 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1">
                <span className="text-xs font-medium">Priority</span>
                <select value={editing.priority ?? 'medium'} onChange={(e) => { const v = e.currentTarget.value as KanbanTask['priority']; setEditing((t) => (t ? { ...t, priority: v } : t)); onTaskUpdate(editing.id, { priority: v }); }} className="rounded-lg border border-neutral-300 px-3 py-2">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-medium">Status</span>
                <select value={editing.status} onChange={(e) => { const to = e.currentTarget.value; const from = editing.status; setEditing((t)=> (t ? { ...t, status: to } : t)); onTaskMove(editing.id, from, to, 0); }} className="rounded-lg border border-neutral-300 px-3 py-2">
                  {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1">
                <span className="text-xs font-medium">Assignee</span>
                <input value={editing.assignee ?? ''} onChange={(e)=> { const v = e.currentTarget.value; setEditing((t)=> (t ? { ...t, assignee: v } : t)); onTaskUpdate(editing.id, { assignee: v }); }} className="rounded-lg border border-neutral-300 px-3 py-2" list="assignees" />
                <datalist id="assignees">
                  {Array.from(new Set(Object.values(tasks).map(t=>t.assignee).filter(Boolean) as string[])).map(a => <option key={a} value={a} />)}
                </datalist>
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-medium">Due date</span>
                <input type="date" value={editing.dueDate ? new Date(editing.dueDate).toISOString().slice(0,10) : ''} onChange={(e)=> { const v = e.currentTarget.value ? new Date(e.currentTarget.value) : undefined; setEditing((t)=> (t ? { ...t, dueDate: v } : t)); onTaskUpdate(editing.id, { dueDate: v }); }} className="rounded-lg border border-neutral-300 px-3 py-2" />
              </label>
            </div>
            <label className="grid gap-1">
              <span className="text-xs font-medium">Description</span>
              <textarea
                value={editing.description ?? ''}
                onChange={(e) => { const v = e.currentTarget.value; setEditing((t) => (t ? { ...t, description: v } : t)); onTaskUpdate(editing.id, { description: v }); }}
                className="min-h-24 resize-y rounded-lg border border-neutral-300 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              />
            </label>
            <div className="grid gap-2">
              <span className="text-xs font-medium">Tags</span>
              <div className="flex flex-wrap gap-2">
                {(editing.tags ?? []).map(tag => (
                  <button type="button" key={tag} className="rounded bg-neutral-100 px-2 py-0.5 text-xs" onClick={()=> { const next = (editing.tags ?? []).filter(t => t !== tag); setEditing((t)=> (t ? { ...t, tags: next } : t)); onTaskUpdate(editing.id, { tags: next }); }}>#{tag} ✕</button>
                ))}
                <input placeholder="Add tag" className="rounded border px-2 py-1 text-xs" onKeyDown={(e)=> { if (e.key === 'Enter' && e.currentTarget.value.trim()) { const v = e.currentTarget.value.trim(); const next = Array.from(new Set([...(editing.tags ?? []), v])); setEditing((t)=> (t ? { ...t, tags: next } : t)); onTaskUpdate(editing.id, { tags: next }); e.currentTarget.value=''; } }} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" className="rounded border px-3 py-1.5" onClick={() => setEditing(null)}>Close</button>
              <button type="button" className="rounded bg-red-600 px-3 py-1.5 text-white" onClick={() => { onTaskDelete(editing.id); setEditing(null); }}>Delete</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
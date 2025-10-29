import React, { useCallback } from 'react';
import type { KanbanTask } from '../../types/kanban.types';
import { formatDate, getPriorityColor, isOverdue } from '../../utils/task.utils';
import { Avatar } from '../primitives/Avatar';

interface KanbanCardProps {
  task: KanbanTask;
  columnId: string;
  isDragging?: boolean;
  onEdit: (task: KanbanTask) => void;
  onDelete: (taskId: string) => void;
  onDragStart: (id: string, fromColumnId: string) => void;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  onDuplicate?: (task: KanbanTask) => void;
  onKeyboardMoveInColumn?: (taskId: string, columnId: string, delta: number) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ task, columnId, isDragging = false, onEdit, onDelete, onDragStart, selectable = true, selected = false, onToggleSelect, onDuplicate, onKeyboardMoveInColumn }) => {
  const [kbdGrab, setKbdGrab] = React.useState(false);
  const moveFocusInColumn = (el: HTMLElement, target: 'prev' | 'next' | 'first' | 'last') => {
    const col = el.closest('[data-column]') as HTMLElement | null;
    if (!col) return;
    const cards = Array.from(col.querySelectorAll<HTMLElement>('[data-card]'));
    if (cards.length === 0) return;
    const idx = cards.indexOf(el);
    const nextIdx = target === 'first' ? 0 : target === 'last' ? cards.length - 1 : Math.max(0, Math.min(cards.length - 1, idx + (target === 'next' ? 1 : -1)));
    cards[nextIdx]?.focus();
  };

  const moveFocusAcrossColumns = (el: HTMLElement, dir: 'left' | 'right') => {
    const col = el.closest('[data-column]') as HTMLElement | null;
    if (!col) return;
    const allCols = Array.from(document.querySelectorAll<HTMLElement>('[data-column]'));
    const colIdx = allCols.indexOf(col);
    const targetCol = allCols[colIdx + (dir === 'right' ? 1 : -1)];
    if (!targetCol) return;
    const targetCards = Array.from(targetCol.querySelectorAll<HTMLElement>('[data-card]'));
    (targetCards[0] ?? targetCol).focus();
  };

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const self = e.currentTarget as HTMLElement;
    if (!kbdGrab && (e.key === 'Enter')) onEdit(task);
    if (!kbdGrab && e.key === ' ') { e.preventDefault(); setKbdGrab((v) => !v); return; }
    if (!kbdGrab && e.key === 'Delete') { onDelete(task.id); return; }

    if (!kbdGrab) {
      if (e.key === 'ArrowUp') { e.preventDefault(); moveFocusInColumn(self, 'prev'); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); moveFocusInColumn(self, 'next'); return; }
      if (e.key === 'Home') { e.preventDefault(); moveFocusInColumn(self, 'first'); return; }
      if (e.key === 'End') { e.preventDefault(); moveFocusInColumn(self, 'last'); return; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); moveFocusAcrossColumns(self, 'left'); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); moveFocusAcrossColumns(self, 'right'); return; }
    }

    if (kbdGrab && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      const delta = e.key === 'ArrowUp' ? -1 : 1;
      onKeyboardMoveInColumn?.(task.id, columnId, delta);
    }
    if (kbdGrab && (e.key === 'Enter' || e.key === 'Escape')) { e.preventDefault(); setKbdGrab(false); }
  }, [task, columnId, onEdit, onDelete, onKeyboardMoveInColumn, kbdGrab]);

  return (
    <div
      role="button"
      data-card
      tabIndex={0}
      aria-label={`${task.title}. Status: ${task.status}. Priority: ${task.priority ?? 'medium'}. Press space to grab.`}
      aria-grabbed={isDragging || kbdGrab}
      onKeyDown={onKeyDown}
      draggable
      onDragStart={(e) => { e.dataTransfer.setData('text/plain', task.id); e.dataTransfer.setData('fromColumn', columnId); e.dataTransfer.effectAllowed = 'move'; onDragStart(task.id, columnId); }}
      className={`group cursor-grab active:cursor-grabbing rounded-lg border border-neutral-200 bg-white p-3 shadow-card hover:shadow-card-hover transition-shadow ${getPriorityColor(task.priority ?? 'medium')}`}
    >
      <div className="mb-2 flex items-start justify-between">
        <h4 className="md:line-clamp-2 line-clamp-none text-sm font-medium text-neutral-900">{task.title}</h4>
        <div className="flex items-center gap-2">
          {selectable && (
            <input aria-label="Select task" type="checkbox" checked={selected} onChange={() => onToggleSelect?.(task.id)} />
          )}
          {task.priority && (
            <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs capitalize">{task.priority}</span>
          )}
        </div>
      </div>
      {task.description && (
        <p className="mb-2 md:line-clamp-2 line-clamp-none text-xs text-neutral-600">{task.description}</p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {task.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded bg-neutral-100 px-2 py-0.5 text-xs">{tag}</span>
          ))}
        </div>
        {task.assignee && <Avatar name={task.assignee} />}
      </div>
      {task.dueDate && (
        <div className={`mt-2 text-xs ${isOverdue(task.dueDate) ? 'text-red-600' : 'text-neutral-500'}`}>Due: {formatDate(task.dueDate)}</div>
      )}
      {(task.commentsCount || task.attachmentsCount) && (
        <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
          {typeof task.commentsCount === 'number' && <span>💬 {task.commentsCount}</span>}
          {typeof task.attachmentsCount === 'number' && <span>📎 {task.attachmentsCount}</span>}
        </div>
      )}
      <div className="mt-2 hidden items-center justify-end gap-2 group-hover:flex">
        <button aria-label="Quick edit" className="rounded p-1 text-neutral-500 hover:bg-neutral-100" onClick={() => onEdit(task)}>✎</button>
        <button aria-label="Duplicate" className="rounded p-1 text-neutral-500 hover:bg-neutral-100" onClick={() => onDuplicate?.(task)}>⎘</button>
        <button aria-label="Delete" className="rounded p-1 text-neutral-500 hover:bg-neutral-100" onClick={() => onDelete(task.id)}>🗑️</button>
      </div>
    </div>
  );
};
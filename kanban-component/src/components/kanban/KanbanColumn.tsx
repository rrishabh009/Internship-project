import React, { useCallback, useMemo, useState } from 'react';
import type { KanbanColumn as KanbanColumnT, KanbanTask } from '../../types/kanban.types';
import { canAddTask, wipState } from '../../utils/column.utils';
import { KanbanCard } from './KanbanCard';

interface Props {
  column: KanbanColumnT;
  tasks: KanbanTask[];
  onAddTask: (columnId: string) => void;
  onEditTask: (task: KanbanTask) => void;
  onDeleteTask: (taskId: string) => void;
  onMove: (taskId: string, fromColumn: string, toColumn: string, index: number) => void;
  onDragStart: (taskId: string, fromColumn: string) => void;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onDuplicateTask?: (task: KanbanTask) => void;
}

export const KanbanColumn: React.FC<Props> = ({ column, tasks, onAddTask, onEditTask, onDeleteTask, onMove, onDragStart, selectedIds, onToggleSelect, onDuplicateTask }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 30 });
  const itemHeight = 120; // average card height

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const start = Math.floor(scrollTop / itemHeight);
    const end = start + 30;
    setVisibleRange({ start, end });
  }, []);

  const wip = wipState(column);
  const border = wip === 'over' ? 'ring-2 ring-red-500' : wip === 'near' ? 'ring-1 ring-warning-500' : '';
  const [collapsed, setCollapsed] = useState<boolean>(!!column.collapsed);
  const [menu, setMenu] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [wipLimit, setWipLimit] = useState<number | undefined>(column.maxTasks);

  const [isOver, setIsOver] = useState(false);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const from = (e.dataTransfer.getData('fromColumn') || column.id) as string;
    onMove(id, from, column.id, tasks.length);
    setIsOver(false);
  }, [column.id, onMove, tasks.length]);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsOver(true);
  }, []);

  const onDragLeave = useCallback(() => setIsOver(false), []);

  const dropAt = useCallback((index: number) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const from = (e.dataTransfer.getData('fromColumn') || column.id) as string;
    onMove(id, from, column.id, index);
    setIsOver(false);
  }, [column.id, onMove]);

  const virtualTasks = useMemo(() => tasks.slice(visibleRange.start, visibleRange.end), [tasks, visibleRange]);

  return (
    <div role="region" data-column aria-label={`${title} column. ${tasks.length} tasks.`} className={`flex h-full w-full md:w-1/2 md:basis-1/2 lg:w-[300px] lg:basis-auto shrink-0 snap-start flex-col rounded-xl bg-neutral-100 ${border} ${isOver ? 'ring-2 ring-primary-500' : ''}`}>
      <div className="sticky top-0 z-10 flex items-center justify-between bg-neutral-100/90 p-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <button className="rounded p-1 text-neutral-600 hover:bg-neutral-200" aria-label={collapsed ? 'Expand column' : 'Collapse column'} onClick={() => setCollapsed((v) => !v)}>{collapsed ? '▶' : '▼'}</button>
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: column.color }} />
          <h3 className="text-sm font-semibold">{title}</h3>
          <span className="text-xs text-neutral-500">{tasks.length}{wipLimit ? `/${wipLimit}` : ''}</span>
          {wip === 'near' && <span className="text-[10px] text-warning-500">WIP near</span>}
          {wip === 'over' && <span className="text-[10px] text-red-600">WIP over</span>}
        </div>
        <div className="relative flex items-center gap-1">
          <button className="rounded p-1 text-neutral-600 hover:bg-neutral-200" aria-label="Add task" onClick={() => onAddTask(column.id)}>＋</button>
          <button className="rounded p-1 text-neutral-600 hover:bg-neutral-200" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>⋮</button>
          {menu && (
            <div role="menu" className="absolute right-0 top-8 z-20 w-40 rounded-md border bg-white p-1 shadow-card">
              <button className="w-full rounded px-2 py-1 text-left hover:bg-neutral-100" onClick={() => { const v = prompt('Rename column', title); if (v) setTitle(v); setMenu(false); }}>Rename</button>
              <button className="w-full rounded px-2 py-1 text-left hover:bg-neutral-100" onClick={() => { const v = prompt('Set WIP limit (blank to clear)', wipLimit?.toString() ?? ''); setWipLimit(v ? Number(v) : undefined); setMenu(false); }}>Set WIP</button>
              <button className="w-full rounded px-2 py-1 text-left text-red-600 hover:bg-red-50" onClick={() => { if (confirm('Delete column?')) { /* demo: local only */ } setMenu(false); }}>Delete</button>
            </div>
          )}
        </div>
      </div>
      {collapsed ? (
        <div className="p-3 text-xs text-neutral-500">Collapsed</div>
      ) : (
      <div className="thin-scrollbar relative grow overflow-y-auto p-3" onScroll={handleScroll} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
        <div style={{ height: tasks.length * itemHeight }} className="relative">
          <div className="absolute left-0 right-0" style={{ top: visibleRange.start * itemHeight }}>
            <div className="grid gap-3">
              {virtualTasks.map((t: KanbanTask, i: number) => (
                <div key={t.id} onDragOver={(e)=> e.preventDefault()} onDrop={dropAt(visibleRange.start + i)}>
                  <KanbanCard task={t} columnId={column.id} onEdit={onEditTask} onDelete={onDeleteTask} onDragStart={(id) => onDragStart(id, column.id)} selected={selectedIds?.has(t.id)} onToggleSelect={onToggleSelect} onDuplicate={onDuplicateTask} onKeyboardMoveInColumn={(taskId, _col, delta) => {
                    const currentIndex = column.taskIds.indexOf(taskId);
                    const nextIndex = Math.max(0, Math.min(column.taskIds.length - 1, currentIndex + delta));
                    onMove(taskId, column.id, column.id, nextIndex);
                  }} />
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="rounded-md border border-dashed border-neutral-300 p-4 text-center text-sm text-neutral-500">No tasks</div>
              )}
            </div>
          </div>
        </div>
      </div>
      )}
      <button disabled={!canAddTask({ ...column, maxTasks: wipLimit })} onClick={() => onAddTask(column.id)} className="m-3 rounded-lg border border-neutral-300 bg-white py-2 text-sm hover:bg-neutral-50 disabled:opacity-50">Add Task</button>
    </div>
  );
};

import { useCallback, useMemo, useState } from 'react';
import type { KanbanColumn, KanbanTask } from '../types/kanban.types';
import { moveTaskBetweenColumns, reorderTasks } from '../utils/task.utils';

export interface BoardState {
  columns: KanbanColumn[];
  tasks: Record<string, KanbanTask>;
}

export const useKanbanBoard = (initial: BoardState) => {
  const [columns, setColumns] = useState<KanbanColumn[]>(initial.columns);
  const [tasks, setTasks] = useState<Record<string, KanbanTask>>(initial.tasks);

  const columnById = useMemo(() => Object.fromEntries(columns.map((c) => [c.id, c])), [columns]);

  const onTaskMove = useCallback((taskId: string, fromColumn: string, toColumn: string, newIndex: number) => {
    if (fromColumn === toColumn) {
      setColumns((prev) => prev.map((c) => (c.id === fromColumn ? { ...c, taskIds: reorderTasks(c.taskIds, c.taskIds.indexOf(taskId), newIndex) } : c)));
    } else {
      setColumns((prev) => prev.map((c) => {
        if (c.id === fromColumn) return { ...c, taskIds: c.taskIds.filter((id) => id !== taskId) };
        if (c.id === toColumn) return { ...c, taskIds: [...c.taskIds.slice(0, newIndex), taskId, ...c.taskIds.slice(newIndex)] };
        return c;
      }));
      setTasks((prev) => ({ ...prev, [taskId]: { ...prev[taskId], status: toColumn } }));
    }
  }, []);

  const onTaskCreate = useCallback((columnId: string, task: KanbanTask) => {
    setTasks((prev) => ({ ...prev, [task.id]: task }));
    setColumns((prev) => prev.map((c) => (c.id === columnId ? { ...c, taskIds: [task.id, ...c.taskIds] } : c)));
  }, []);

  const onTaskUpdate = useCallback((taskId: string, updates: Partial<KanbanTask>) => {
    setTasks((prev) => ({ ...prev, [taskId]: { ...prev[taskId], ...updates } }));
  }, []);

  const onTaskDelete = useCallback((taskId: string) => {
    setColumns((prev) => prev.map((c) => ({ ...c, taskIds: c.taskIds.filter((id) => id !== taskId) })));
    setTasks((prev) => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
  }, []);

  const onReorderWithin = useCallback((columnId: string, start: number, end: number) => {
    setColumns((prev) => prev.map((c) => (c.id === columnId ? { ...c, taskIds: reorderTasks(c.taskIds, start, end) } : c)));
  }, []);

  const onMoveBetween = useCallback((fromId: string, toId: string, start: number, end: number) => {
    setColumns((prev) => prev.map((c) => {
      if (c.id === fromId) return c; // updated below in a single pass
      return c;
    }));
    setColumns((prev) => {
      const from = prev.find((c) => c.id === fromId)!;
      const to = prev.find((c) => c.id === toId)!;
      const moved = moveTaskBetweenColumns(from.taskIds, to.taskIds, start, end);
      return prev.map((c) =>
        c.id === fromId ? { ...c, taskIds: moved.source } : c.id === toId ? { ...c, taskIds: moved.destination } : c
      );
    });
  }, []);

  return { columns, tasks, columnById, onTaskMove, onTaskCreate, onTaskUpdate, onTaskDelete, onReorderWithin, onMoveBetween };
};
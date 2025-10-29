import type { KanbanColumn } from '../types/kanban.types';

export const canAddTask = (column: KanbanColumn): boolean =>
  !column.maxTasks || column.taskIds.length < column.maxTasks;

export const wipState = (column: KanbanColumn): 'ok' | 'near' | 'over' => {
  if (!column.maxTasks) return 'ok';
  if (column.taskIds.length > column.maxTasks) return 'over';
  if (column.taskIds.length >= Math.max(1, column.maxTasks - 1)) return 'near';
  return 'ok';
};
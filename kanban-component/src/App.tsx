import { KanbanBoard } from './components/kanban';
import type { KanbanTask } from './types/kanban.types';
import { useKanbanBoard, type BoardState } from './hooks/useKanbanBoard';

const initial: BoardState = {
  columns: [
    { id: 'todo', title: 'Todo', color: '#eab308', taskIds: ['t1', 't2'], maxTasks: 6 },
    { id: 'in-progress', title: 'In Progress', color: '#0ea5e9', taskIds: ['t3'], maxTasks: 6 },
    { id: 'done', title: 'Done', color: '#22c55e', taskIds: ['t4'], maxTasks: 6 },
  ],
  tasks: {
    t1: { id: 't1', title: 'Initial planning', status: 'todo', priority: 'high', createdAt: new Date() },
    t2: { id: 't2', title: 'Design tokens', status: 'todo', priority: 'medium', createdAt: new Date() },
    t3: { id: 't3', title: 'Implement board shell', status: 'in-progress', priority: 'urgent', createdAt: new Date() },
    t4: { id: 't4', title: 'Repo setup', status: 'done', priority: 'low', createdAt: new Date() },
  },
};

export default function App() {
  const {
    columns,
    tasks,
    onTaskMove,
    onTaskCreate,
    onTaskUpdate,
    onTaskDelete,
  } = useKanbanBoard(initial);

  return (
    <div className="min-h-screen w-full bg-neutral-50 p-4 lg:p-6">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Kanban Board</h1>
        <button
          className="rounded bg-primary-600 px-3 py-1.5 text-white hover:bg-primary-700"
          onClick={() => {
            // Quick-add to first column
            const first = columns[0];
            const id = `task-${Math.random().toString(36).slice(2, 9)}`;
            const task: KanbanTask = { id, title: 'New Task', status: first.id, createdAt: new Date() };
            onTaskCreate(first.id, task);
          }}
        >
          Add Task
        </button>
      </div>
      <KanbanBoard
        columns={columns}
        tasks={tasks}
        onTaskMove={onTaskMove}
        onTaskCreate={onTaskCreate}
        onTaskUpdate={onTaskUpdate}
        onTaskDelete={onTaskDelete}
      />
    </div>
  );
}

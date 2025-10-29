import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { KanbanBoard } from './KanbanBoard';
import type { KanbanColumn, KanbanTask } from '../../types/kanban.types';

const sampleColumns: KanbanColumn[] = [
  { id: 'todo', title: 'Todo', color: '#eab308', taskIds: ['task-1', 'task-2'], maxTasks: 6 },
  { id: 'in-progress', title: 'In Progress', color: '#0ea5e9', taskIds: ['task-3'], maxTasks: 6 },
  { id: 'review', title: 'Review', color: '#a855f7', taskIds: [], maxTasks: 6 },
  { id: 'done', title: 'Done', color: '#22c55e', taskIds: ['task-4', 'task-5'], maxTasks: 6 },
];

const sampleTasks: Record<string, KanbanTask> = {
  'task-1': { id: 'task-1', title: 'Design app shell', status: 'todo', priority: 'high', assignee: 'Jane Smith', tags: ['design'], createdAt: new Date(2024, 0, 10) },
  'task-2': { id: 'task-2', title: 'Write API contracts', status: 'todo', priority: 'medium', assignee: 'John Doe', tags: ['backend'], createdAt: new Date(2024, 0, 9) },
  'task-3': { id: 'task-3', title: 'Setup TypeScript', status: 'in-progress', priority: 'urgent', assignee: 'John Doe', tags: ['setup','typescript'], createdAt: new Date(2024,0,9) },
  'task-4': { id: 'task-4', title: 'Create project structure', description: 'Setup folder structure and initial files', status: 'done', priority: 'low', assignee: 'Jane Smith', tags: ['setup'], createdAt: new Date(2024,0,8), dueDate: new Date(2024,0,9) },
  'task-5': { id: 'task-5', title: 'Install dependencies', status: 'done', priority: 'low', assignee: 'John Doe', tags: ['setup'], createdAt: new Date(2024,0,8) },
};

const meta: Meta<typeof KanbanBoard> = {
  title: 'Kanban/KanbanBoard',
  component: KanbanBoard,
  parameters: { layout: 'fullscreen' },
  argTypes: {},
};
export default meta;

type Story = StoryObj<typeof KanbanBoard>;

function useLocalState() {
  const [columns, setColumns] = React.useState(sampleColumns);
  const [tasks, setTasks] = React.useState(sampleTasks);
  return {
    columns,
    tasks,
    onTaskMove: (taskId: string, from: string, to: string, index: number) => {
      setColumns((prev) => {
        const clone = prev.map((c) => ({ ...c }));
        const fromCol = clone.find((c) => c.id === from)!;
        const toCol = clone.find((c) => c.id === to)!;
        fromCol.taskIds = fromCol.taskIds.filter((id) => id !== taskId);
        toCol.taskIds.splice(index, 0, taskId);
        return clone;
      });
      setTasks((prev) => ({ ...prev, [taskId]: { ...prev[taskId], status: to } }));
    },
    onTaskCreate: (columnId: string, task: KanbanTask) => {
      setTasks((prev) => ({ ...prev, [task.id]: task }));
      setColumns((prev) => prev.map((c) => (c.id === columnId ? { ...c, taskIds: [task.id, ...c.taskIds] } : c)));
    },
    onTaskUpdate: (taskId: string, updates: Partial<KanbanTask>) => {
      setTasks((prev) => ({ ...prev, [taskId]: { ...prev[taskId], ...updates } }));
    },
    onTaskDelete: (taskId: string) => {
      setColumns((prev) => prev.map((c) => ({ ...c, taskIds: c.taskIds.filter((id) => id !== taskId) })));
      setTasks((prev) => { const cp = { ...prev } as Record<string, KanbanTask>; delete cp[taskId]; return cp; });
    },
  };
}

const DefaultComponent = () => { const state = useLocalState(); return <KanbanBoard {...state} />; };
export const Default: Story = { render: () => <DefaultComponent /> };

const EmptyComponent = () => { const state = useLocalState(); state.columns = state.columns.map((c) => ({ ...c, taskIds: [] })); return <KanbanBoard {...state} />; };
export const Empty: Story = { render: () => <EmptyComponent /> };

const LargeDatasetComponent = () => {
  const s = useLocalState();
  const many: Record<string, KanbanTask> = { ...s.tasks };
  const cols = s.columns.map((c) => ({ ...c, taskIds: [] as string[] }));
  for (let i = 0; i < 120; i++) {
    const id = `task-${i + 100}`; const col = cols[i % cols.length];
    many[id] = { id, title: `Task ${i + 1}`, status: col.id, createdAt: new Date() };
    (col.taskIds as string[]).push(id);
  }
  return <KanbanBoard {...s} tasks={many} columns={cols} />;
};
export const LargeDataset: Story = { render: () => <LargeDatasetComponent /> };

const MobileComponent = () => { const state = useLocalState(); return <KanbanBoard {...state} />; };
export const MobileResponsive: Story = { parameters: { viewport: { defaultViewport: 'iphone14' } }, render: () => <MobileComponent /> };

const PlaygroundComponent = () => { const state = useLocalState(); return <KanbanBoard {...state} />; };
export const InteractivePlayground: Story = { args: {}, render: () => <PlaygroundComponent /> };

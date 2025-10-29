/** Checks if a task is overdue */
export const isOverdue = (dueDate: Date): boolean => new Date() > dueDate;

/** Gets initials from a name */
export const getInitials = (name: string): string =>
  name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);

/** Calculates priority color classes */
export const getPriorityColor = (priority: string): string => {
  const colors = {
    low: 'border-l-4 border-blue-500 bg-blue-50 text-blue-700',
    medium: 'border-l-4 border-yellow-500 bg-yellow-50 text-yellow-700',
    high: 'border-l-4 border-orange-500 bg-orange-50 text-orange-700',
    urgent: 'border-l-4 border-red-500 bg-red-50 text-red-700',
  } as const;
  return (colors as Record<string, string>)[priority] ?? colors.medium;
};

/** Reorders tasks after drag and drop */
export const reorderTasks = (
  tasks: string[],
  startIndex: number,
  endIndex: number
): string[] => {
  const result = Array.from(tasks);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

/** Moves task between columns */
export const moveTaskBetweenColumns = (
  sourceColumn: string[],
  destColumn: string[],
  sourceIndex: number,
  destIndex: number
): { source: string[]; destination: string[] } => {
  const sourceClone = Array.from(sourceColumn);
  const destClone = Array.from(destColumn);
  const [removed] = sourceClone.splice(sourceIndex, 1);
  destClone.splice(destIndex, 0, removed);
  return { source: sourceClone, destination: destClone };
};

export const formatDate = (d: Date): string =>
  new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: '2-digit' }).format(d);
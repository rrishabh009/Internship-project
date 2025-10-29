import { useState, useCallback } from 'react';

interface DragState {
  isDragging: boolean;
  draggedId: string | null;
  dragFromColumn: string | null;
  dropTargetId: string | null;
  dragOverIndex: number | null;
}

export const useDragAndDrop = () => {
  const [state, setState] = useState<DragState>({
    isDragging: false,
    draggedId: null,
    dragFromColumn: null,
    dropTargetId: null,
    dragOverIndex: null,
  });

  const handleDragStart = useCallback((id: string, fromColumnId: string) => {
    setState((prev) => ({ ...prev, isDragging: true, draggedId: id, dragFromColumn: fromColumnId }));
  }, []);

  const handleDragOver = useCallback((targetId: string, index: number) => {
    setState((prev) => ({ ...prev, dropTargetId: targetId, dragOverIndex: index }));
  }, []);

  const handleDragEnd = useCallback(() => {
    setState({ isDragging: false, draggedId: null, dragFromColumn: null, dropTargetId: null, dragOverIndex: null });
  }, []);

  return { ...state, handleDragStart, handleDragOver, handleDragEnd };
};
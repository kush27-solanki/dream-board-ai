import { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { COLUMNS, TaskStatus } from '@/types/kanban';
import { useTasks } from '@/hooks/useTasks';
import { KanbanColumn } from './KanbanColumn';
import { AddTaskDialog } from './AddTaskDialog';
import { Skeleton } from '@/components/ui/skeleton';

export function KanbanBoard() {
  const {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderTasks
  } = useTasks();

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [addingToColumn, setAddingToColumn] = useState<TaskStatus>('todo');

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    // Dropped in same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceStatus = source.droppableId as TaskStatus;
    const destStatus = destination.droppableId as TaskStatus;

    if (sourceStatus === destStatus) {
      // Reorder within same column
      reorderTasks(sourceStatus, source.index, destination.index);
    } else {
      // Move to different column
      moveTask(draggableId, destStatus, destination.index);
    }
  };

  const handleAddTask = (status: TaskStatus) => {
    setAddingToColumn(status);
    setIsAddingTask(true);
  };

  const handleCreateTask = async (title: string, description: string) => {
    await createTask(title, description, addingToColumn);
    setIsAddingTask(false);
  };

  if (loading) {
    return (
      <div className="flex gap-6 p-6 overflow-x-auto">
        {COLUMNS.map(col => (
          <div key={col.id} className="bg-secondary/30 rounded-2xl p-4 min-w-[320px]">
            <Skeleton className="h-6 w-24 mb-4" />
            <Skeleton className="h-24 w-full mb-3 rounded-xl" />
            <Skeleton className="h-24 w-full mb-3 rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 p-6 overflow-x-auto min-h-[calc(100vh-80px)]">
          {COLUMNS.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={tasks.filter(t => t.status === column.id)}
              onAddTask={handleAddTask}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
            />
          ))}
        </div>
      </DragDropContext>

      <AddTaskDialog
        open={isAddingTask}
        onOpenChange={setIsAddingTask}
        onSubmit={handleCreateTask}
        columnTitle={COLUMNS.find(c => c.id === addingToColumn)?.title || ''}
      />
    </>
  );
}

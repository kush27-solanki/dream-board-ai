import { Droppable } from '@hello-pangea/dnd';
import { Column, Task } from '@/types/kanban';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onAddTask: (status: Column['id']) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

export function KanbanColumn({
  column,
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask
}: KanbanColumnProps) {
  const sortedTasks = [...tasks].sort((a, b) => a.position - b.position);

  const statusColors = {
    todo: 'bg-status-todo',
    progress: 'bg-status-progress',
    complete: 'bg-status-complete'
  };

  return (
    <div className="kanban-column flex flex-col bg-secondary/30 rounded-2xl p-4 min-w-[320px] max-w-[320px]">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${statusColors[column.color]}`} />
          <h3 className="font-display font-semibold text-foreground">
            {column.title}
          </h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onAddTask(column.id)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Tasks List */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex-1 min-h-[200px] rounded-xl transition-colors duration-200
              ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}
            `}
          >
            {sortedTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}

            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <p className="text-sm">No tasks yet</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-xs"
                  onClick={() => onAddTask(column.id)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add task
                </Button>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}

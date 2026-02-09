import { useState } from 'react';
import { Plus, LayoutGrid, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddTaskDialog } from './AddTaskDialog';
import { TaskStatus } from '@/types/kanban';

interface HeaderProps {
  onCreateTask: (title: string, description: string, status: TaskStatus) => void;
}

export function Header({ onCreateTask }: HeaderProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);

  const handleSubmit = (title: string, description: string) => {
    onCreateTask(title, description, 'todo');
    setIsAddingTask(false);
  };

  return (
    <>
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <LayoutGrid className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">
                Kanban Board
              </h1>
              <p className="text-sm text-muted-foreground">
                Organize your tasks with style
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsAddingTask(true)}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </header>

      <AddTaskDialog
        open={isAddingTask}
        onOpenChange={setIsAddingTask}
        onSubmit={handleSubmit}
        columnTitle="To-Do"
      />
    </>
  );
}

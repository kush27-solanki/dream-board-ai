import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { Header } from '@/components/kanban/Header';
import { AIChatbot } from '@/components/chat/AIChatbot';
import { useTasks } from '@/hooks/useTasks';

const Index = () => {
  const { createTask } = useTasks();

  return (
    <div className="min-h-screen bg-background">
      <Header onCreateTask={createTask} />
      <KanbanBoard />
      <AIChatbot />
    </div>
  );
};

export default Index;

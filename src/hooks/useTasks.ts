import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskStatus } from '@/types/kanban';
import { toast } from 'sonner';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;
      setTasks(data as Task[]);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create task
  const createTask = useCallback(async (title: string, description: string, status: TaskStatus = 'todo') => {
    try {
      const statusTasks = tasks.filter(t => t.status === status);
      const maxPosition = statusTasks.length > 0 
        ? Math.max(...statusTasks.map(t => t.position)) 
        : -1;

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title,
          description: description || null,
          status,
          position: maxPosition + 1
        })
        .select()
        .single();

      if (error) throw error;
      setTasks(prev => [...prev, data as Task]);
      toast.success('Task created!');
      return data as Task;
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
      return null;
    }
  }, [tasks]);

  // Update task
  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  }, []);

  // Delete task
  const deleteTask = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== id));
      toast.success('Task deleted');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  }, []);

  // Move task to different column
  const moveTask = useCallback(async (
    taskId: string,
    newStatus: TaskStatus,
    newPosition: number
  ) => {
    const taskToMove = tasks.find(t => t.id === taskId);
    if (!taskToMove) return;

    // Optimistic update
    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id === taskId) {
          return { ...t, status: newStatus, position: newPosition };
        }
        return t;
      });
      return updated;
    });

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus, position: newPosition })
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error moving task:', error);
      toast.error('Failed to move task');
      fetchTasks(); // Revert on error
    }
  }, [tasks, fetchTasks]);

  // Reorder tasks within same column
  const reorderTasks = useCallback(async (
    status: TaskStatus,
    sourceIndex: number,
    destinationIndex: number
  ) => {
    const columnTasks = tasks
      .filter(t => t.status === status)
      .sort((a, b) => a.position - b.position);

    const [movedTask] = columnTasks.splice(sourceIndex, 1);
    columnTasks.splice(destinationIndex, 0, movedTask);

    // Update positions
    const updates = columnTasks.map((task, index) => ({
      id: task.id,
      position: index
    }));

    // Optimistic update
    setTasks(prev => {
      const otherTasks = prev.filter(t => t.status !== status);
      const updatedColumnTasks = columnTasks.map((task, index) => ({
        ...task,
        position: index
      }));
      return [...otherTasks, ...updatedColumnTasks];
    });

    try {
      // Update each task's position
      for (const update of updates) {
        await supabase
          .from('tasks')
          .update({ position: update.position })
          .eq('id', update.id);
      }
    } catch (error) {
      console.error('Error reordering tasks:', error);
      toast.error('Failed to reorder tasks');
      fetchTasks();
    }
  }, [tasks, fetchTasks]);

  // Subscribe to realtime updates
  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderTasks,
    refetch: fetchTasks
  };
}

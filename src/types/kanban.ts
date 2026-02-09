export type TaskStatus = 'todo' | 'in_progress' | 'complete';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: TaskStatus;
  title: string;
  color: 'todo' | 'progress' | 'complete';
}

export const COLUMNS: Column[] = [
  { id: 'todo', title: 'To-Do', color: 'todo' },
  { id: 'in_progress', title: 'In Progress', color: 'progress' },
  { id: 'complete', title: 'Complete', color: 'complete' },
];

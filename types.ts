export enum TaskStatus {
  ToDo = 'todo',
  InProgress = 'inprogress',
  Done = 'done',
}

export enum Priority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
  priority: Priority;
}

export interface Reminder {
  id:string;
  text: string;
  remindAt: string;
}

export interface ChartData {
  name: string;
  value: number;
}

export type PriorityColors = {
  [key in Priority]: {
    background: string;
    border: string;
    badge: string;
    badgeText: string;
  };
};

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

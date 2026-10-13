import type { User } from '../../users/model/types';
export type Status = 'new' | 'in_progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';
export interface ActivityEvent {
  id: string;
  taskId: string;
  kind: 'created' | 'updated' | 'comment';
  attachments?: Attachment[];
  message: string;
  createdAt: string;
}
export interface Attachment {
  id: string;
  name: string;
  contentType: string;
  size: number;
}
export type AttachmentInput =
  { id: string } | { name: string; contentType: string; dataBase64: string };
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  createdAt: string;
  updatedAt: string;
  labels?: string[];
  assigneeId?: string | null;
  assignee?: User | null;
  attachments?: Attachment[];
}
export type TaskInput = Pick<Task, 'title' | 'description' | 'priority' | 'status'> & {
  labels?: string[];
  assigneeId?: string | null;
  attachments?: AttachmentInput[];
};

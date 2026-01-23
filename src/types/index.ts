export type TaskStatus = 'new' | 'in_progress' | 'completed' | 'postponed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type AssigneeType = 'me' | 'partner' | 'both';
export type ApprovalStatus = 'pending' | 'approved' | 'declined';

export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  isShared: boolean;
  assigneeType: AssigneeType;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: Date | null;
  requiresApproval: boolean;
  approvalStatus: ApprovalStatus | null;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  startAt: Date;
  endAt: Date;
  allDay: boolean;
  participants: string;
  location: string | null;
  requiresApproval: boolean;
  approvalStatus: ApprovalStatus | null;
}

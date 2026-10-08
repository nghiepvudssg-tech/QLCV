export type PriorityLevel = 'Cao' | 'Trung bình' | 'Thấp';
export type TaskStatus = 'Chưa bắt đầu' | 'Đang xử lý' | 'Đã hoàn thành';

export interface Task {
  id: string;
  title: string;
  dueDate: string; // Stored in YYYY-MM-DD for sorting/input or formatted DD/MM/YYYY
  department: string;
  assignee: string;
  priority: PriorityLevel;
  status: TaskStatus;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ViewMode = 'table' | 'kanban' | 'dashboard' | 'timeline';

export interface TaskFilters {
  search: string;
  department: string;
  assignee: string;
  priority: string;
  status: string;
}

export type SortField = 'title' | 'dueDate' | 'priority' | 'status' | 'department' | 'assignee';
export type SortOrder = 'asc' | 'desc';

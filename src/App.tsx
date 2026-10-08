/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Task, ViewMode, TaskStatus, TaskFilters } from './types/task';
import { INITIAL_TASKS, DEPARTMENTS, ASSIGNEES } from './data/initialData';
import { exportTasksToCsv } from './utils/csvUtils';
import { getRelativeDueDateStatus } from './utils/dateUtils';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TaskTableView } from './components/TaskTableView';
import { TaskKanbanView } from './components/TaskKanbanView';
import { TaskDashboardView } from './components/TaskDashboardView';
import { TaskTimelineView } from './components/TaskTimelineView';
import { TaskModal } from './components/TaskModal';
import { ImportCsvModal } from './components/ImportCsvModal';
import { CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'DAILY_WORK_TASKS_DATA_V1';

export default function App() {
  // Load tasks from localStorage or use initial CSV data
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load tasks from local storage', e);
    }
    return INITIAL_TASKS;
  });

  // Save to localStorage whenever tasks change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to local storage', e);
    }
  }, [tasks]);

  const [currentView, setCurrentView] = useState<ViewMode>('table');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    department: '',
    assignee: '',
    priority: '',
    status: '',
  });

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Compute dynamic lists of departments & assignees
  const departments = useMemo(() => {
    const set = new Set<string>(DEPARTMENTS);
    tasks.forEach((t) => {
      if (t.department) set.add(t.department.trim());
    });
    return Array.from(set).filter(Boolean);
  }, [tasks]);

  const assignees = useMemo(() => {
    const set = new Set<string>(ASSIGNEES);
    tasks.forEach((t) => {
      if (t.assignee) set.add(t.assignee.trim());
    });
    return Array.from(set).filter(Boolean);
  }, [tasks]);

  const completedCount = useMemo(() => {
    return tasks.filter((t) => t.status === 'Đã hoàn thành').length;
  }, [tasks]);

  const overdueCount = useMemo(() => {
    return tasks.filter((t) => {
      if (t.status === 'Đã hoàn thành' || !t.dueDate) return false;
      const rel = getRelativeDueDateStatus(t.dueDate, t.status);
      return rel.type === 'overdue';
    }).length;
  }, [tasks]);

  // Handlers for task mutations
  const handleSaveTask = (
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string
  ) => {
    const nowIso = new Date().toISOString();
    if (id) {
      // Update existing
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                ...taskData,
                updatedAt: nowIso,
              }
            : t
        )
      );
      showToast(`Đã cập nhật công việc: "${taskData.title}"`);
    } else {
      // Create new
      const newTask: Task = {
        id: `task-${Date.now()}`,
        ...taskData,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      setTasks((prev) => [newTask, ...prev]);
      showToast(`Đã thêm mới công việc: "${taskData.title}"`);
    }
  };

  const handleUpdateStatus = (id: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
      )
    );
    showToast(`Đã chuyển trạng thái sang "${newStatus}"`);
  };

  const handleBatchUpdateStatus = (ids: string[], newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) =>
        ids.includes(t.id) ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
      )
    );
    showToast(`Đã chuyển ${ids.length} công việc sang "${newStatus}"`);
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    showToast('Đã xóa công việc khỏi danh sách');
  };

  const handleBatchDelete = (ids: string[]) => {
    setTasks((prev) => prev.filter((t) => !ids.includes(t.id)));
    showToast(`Đã xóa ${ids.length} công việc đã chọn`);
  };

  const handleDuplicateTask = (task: Task) => {
    const duplicated: Task = {
      ...task,
      id: `task-${Date.now()}`,
      title: `${task.title} (Bản sao)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [duplicated, ...prev]);
    showToast(`Đã nhân bản công việc: "${task.title}"`);
  };

  const handleOpenEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleOpenCreate = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenCreateWithDate = (dateIso: string) => {
    setTaskToEdit({
      id: '',
      title: '',
      dueDate: dateIso,
      department: departments[0] || 'Kỹ thuật Nghiệp vụ',
      assignee: assignees[0] || 'Hoàng Kim Sinh',
      priority: 'Trung bình',
      status: 'Chưa bắt đầu',
      description: '',
    });
    setIsTaskModalOpen(true);
  };

  const handleExportCsv = () => {
    exportTasksToCsv(tasks);
    showToast(`Đã xuất ${tasks.length} công việc ra tệp CSV Excel thành công!`);
  };

  const handleImportCsv = (importedTasks: Task[], mode: 'append' | 'replace') => {
    if (mode === 'replace') {
      setTasks(importedTasks);
      showToast(`Đã thay thế toàn bộ bằng ${importedTasks.length} công việc mới!`);
    } else {
      setTasks((prev) => [...importedTasks, ...prev]);
      showToast(`Đã nhập thêm ${importedTasks.length} công việc vào danh sách!`);
    }
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Bạn có chắc chắn muốn đặt lại danh sách về 16 công việc gốc ban đầu từ bảng tính đã tải lên?'
      )
    ) {
      setTasks(INITIAL_TASKS);
      showToast('Đã khôi phục dữ liệu gốc thành công!');
    }
  };

  return (
    <div className="min-h-screen bg-[#111113] text-[#f2f2f2] font-sans antialiased flex flex-col">
      {/* Sidebar Navigation Drawer */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        onExportCsv={handleExportCsv}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onResetData={handleResetData}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        departmentsCount={departments.length}
        assigneesCount={assignees.length}
        tasksCount={tasks.length}
      />

      {/* Header */}
      <Header
        totalTasks={tasks.length}
        completedTasks={completedCount}
        overdueTasks={overdueCount}
        onOpenCreateModal={handleOpenCreate}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Main Content Viewport (Column 2, Row 2) */}
      <main className="p-4 sm:p-6 lg:p-8 overflow-y-auto flex flex-col gap-6">
        {currentView === 'table' && (
          <TaskTableView
            tasks={tasks}
            filters={filters}
            onFilterChange={setFilters}
            onEditTask={handleOpenEdit}
            onDeleteTask={handleDeleteTask}
            onDuplicateTask={handleDuplicateTask}
            onUpdateStatus={handleUpdateStatus}
            onBatchUpdateStatus={handleBatchUpdateStatus}
            onBatchDelete={handleBatchDelete}
            departments={departments}
            assignees={assignees}
          />
        )}

        {currentView === 'kanban' && (
          <TaskKanbanView
            tasks={tasks}
            onUpdateStatus={handleUpdateStatus}
            onEditTask={handleOpenEdit}
            onDeleteTask={handleDeleteTask}
            onQuickAddTask={(status) => {
              setTaskToEdit({
                id: '',
                title: '',
                dueDate: '',
                department: departments[0] || 'Kỹ thuật Nghiệp vụ',
                assignee: assignees[0] || 'Hoàng Kim Sinh',
                priority: 'Trung bình',
                status,
                description: '',
              });
              setIsTaskModalOpen(true);
            }}
          />
        )}

        {currentView === 'dashboard' && (
          <TaskDashboardView
            tasks={tasks}
            departments={departments}
            assignees={assignees}
            onEditTask={handleOpenEdit}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {currentView === 'timeline' && (
          <TaskTimelineView
            tasks={tasks}
            onEditTask={handleOpenEdit}
            onUpdateStatus={handleUpdateStatus}
            onOpenCreateModalWithDate={handleOpenCreateWithDate}
          />
        )}
      </main>

      {/* Footer (Column 2, Row 3) */}
      <footer className="px-6 lg:px-8 py-3.5 border-t border-[rgba(242,242,242,0.08)] bg-[#111113] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#f2f2f2]/50">
        <div>Kế Hoạch Công Việc Hàng Ngày — Dashboard Core v1.2</div>
        <div className="font-mono tabular-nums text-[#f2f2f2]/60">
          {departments.length} Bộ phận · {assignees.length} Nhân sự · {tasks.length} Công việc
        </div>
      </footer>

      {/* Task Create/Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        departments={departments}
        assignees={assignees}
      />

      {/* Import CSV Modal */}
      <ImportCsvModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportCsv}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#1c1c1e] text-[#f2f2f2] border border-[#d4ff00]/40 rounded-lg shadow-2xl text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#d4ff00] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Task, TaskStatus } from '../types/task';
import { formatIsoToDDMMYYYY, getRelativeDueDateStatus } from '../utils/dateUtils';
import {
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Calendar,
  User,
  Building,
} from 'lucide-react';

interface TaskKanbanViewProps {
  tasks: Task[];
  onUpdateStatus: (id: string, newStatus: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onQuickAddTask: (status: TaskStatus) => void;
}

const COLUMNS: { id: TaskStatus; label: string; accentColor: string; pillColor: string }[] = [
  {
    id: 'Chưa bắt đầu',
    label: 'Chưa bắt đầu',
    accentColor: 'text-[#f2f2f2]/70',
    pillColor: 'bg-[rgba(242,242,242,0.1)] text-[#f2f2f2]/80',
  },
  {
    id: 'Đang xử lý',
    label: 'Đang xử lý',
    accentColor: 'text-[#008cff]',
    pillColor: 'bg-[rgba(0,140,255,0.15)] text-[#008cff] border border-[#008cff]/20',
  },
  {
    id: 'Đã hoàn thành',
    label: 'Đã hoàn thành',
    accentColor: 'text-[#00ff80]',
    pillColor: 'bg-[rgba(0,255,128,0.15)] text-[#00ff80] border border-[#00ff80]/20',
  },
];

export const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({
  tasks,
  onUpdateStatus,
  onEditTask,
  onDeleteTask,
  onQuickAddTask,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    if (dragOverColumn !== colId) {
      setDragOverColumn(colId);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onUpdateStatus(taskId, targetStatus);
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        const isDragOver = dragOverColumn === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex flex-col rounded-lg border border-[rgba(242,242,242,0.1)] bg-[#1c1c1e] overflow-hidden transition-all duration-150 min-h-[540px] ${
              isDragOver ? 'ring-1 ring-[#d4ff00] border-[#d4ff00]/60 bg-[#222226]' : ''
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-[rgba(242,242,242,0.1)] bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <span className={`label-mono font-bold tracking-wider ${col.accentColor}`}>
                  {col.label}
                </span>
                <span className="font-mono text-xs tabular-nums text-[#d4ff00] font-bold">
                  {colTasks.length}
                </span>
              </div>
              <button
                onClick={() => onQuickAddTask(col.id)}
                className="p-1 text-[#f2f2f2]/50 hover:text-[#d4ff00] hover:bg-white/5 rounded transition-colors cursor-pointer"
                title={`Thêm công việc vào mục ${col.label}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Tasks Container */}
            <div className="p-3.5 flex-1 flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-250px)]">
              {colTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-[#f2f2f2]/30 text-xs border border-dashed border-[rgba(242,242,242,0.1)] rounded my-2">
                  <span>Chưa có việc nào</span>
                </div>
              ) : (
                colTasks.map((task) => {
                  const relativeDue = getRelativeDueDateStatus(task.dueDate, task.status);
                  const isDone = task.status === 'Đã hoàn thành';

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="group bg-[#111113] border border-[rgba(242,242,242,0.1)] rounded p-3.5 hover:border-[rgba(242,242,242,0.3)] transition-all cursor-grab active:cursor-grabbing flex flex-col gap-2.5"
                    >
                      {/* Top Row: Priority & Actions */}
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          {task.priority === 'Cao' && (
                            <span className="priority-cao label-mono font-bold text-[#ff4545]">
                              Ưu tiên cao
                            </span>
                          )}
                          {task.priority === 'Trung bình' && (
                            <span className="label-mono font-semibold text-[#f59e0b]">
                              Ưu tiên vừa
                            </span>
                          )}
                          {task.priority === 'Thấp' && (
                            <span className="label-mono text-[#f2f2f2]/40">
                              Ưu tiên thấp
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditTask(task)}
                            className="p-1 text-[#f2f2f2]/50 hover:text-[#d4ff00] cursor-pointer"
                            title="Sửa công việc"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Xác nhận xóa công việc "${task.title}"?`)) {
                                onDeleteTask(task.id);
                              }
                            }}
                            className="p-1 text-[#f2f2f2]/50 hover:text-[#ff4545] cursor-pointer"
                            title="Xóa công việc"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <div
                        onClick={() => onEditTask(task)}
                        className={`text-xs font-semibold leading-snug cursor-pointer hover:text-[#d4ff00] transition-colors ${
                          isDone ? 'line-through text-[#f2f2f2]/40' : 'text-[#f2f2f2]'
                        }`}
                      >
                        {task.title}
                      </div>

                      {/* Description preview */}
                      {task.description && (
                        <p className="text-[11px] text-[#f2f2f2]/50 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Metadata */}
                      <div className="pt-2 border-t border-[rgba(242,242,242,0.06)] flex flex-col gap-1.5 text-[11px]">
                        <div className="flex items-center justify-between text-[#f2f2f2]/70">
                          <div className="flex items-center gap-1.5 truncate">
                            <User className="w-3 h-3 text-[#f2f2f2]/40 shrink-0" />
                            <span className="truncate">{task.assignee}</span>
                          </div>
                          <span className="text-[10px] text-[#f2f2f2]/40 shrink-0">
                            {task.department}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
                          <div className="flex items-center gap-1 text-[#f2f2f2]/80">
                            <Calendar className="w-3 h-3 text-[#f2f2f2]/40 shrink-0" />
                            <span>{formatIsoToDDMMYYYY(task.dueDate)}</span>
                          </div>

                          {!isDone && relativeDue.type === 'overdue' && (
                            <span className="overdue text-[#ff4545] font-bold text-[10px]">
                              {relativeDue.label}
                            </span>
                          )}
                          {!isDone && relativeDue.type === 'today' && (
                            <span className="text-[#d4ff00] font-bold text-[10px]">
                              Hôm nay
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Advance / Regress status controls */}
                      <div className="flex items-center justify-between pt-1">
                        {col.id !== 'Chưa bắt đầu' ? (
                          <button
                            onClick={() => {
                              const prevStatus =
                                col.id === 'Đã hoàn thành' ? 'Đang xử lý' : 'Chưa bắt đầu';
                              onUpdateStatus(task.id, prevStatus);
                            }}
                            className="flex items-center gap-1 text-[10px] text-[#f2f2f2]/40 hover:text-[#f2f2f2] cursor-pointer"
                            title="Lùi trạng thái"
                          >
                            <ArrowLeft className="w-3 h-3" />
                            <span>Lùi</span>
                          </button>
                        ) : <div />}

                        {col.id !== 'Đã hoàn thành' ? (
                          <button
                            onClick={() => {
                              const nextStatus =
                                col.id === 'Chưa bắt đầu' ? 'Đang xử lý' : 'Đã hoàn thành';
                              onUpdateStatus(task.id, nextStatus);
                            }}
                            className="flex items-center gap-1 text-[10px] text-[#d4ff00]/70 hover:text-[#d4ff00] cursor-pointer font-medium"
                            title="Tiến trạng thái"
                          >
                            <span>Tiếp theo</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : <div />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

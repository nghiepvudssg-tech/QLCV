import React from 'react';
import { Task, TaskStatus } from '../types/task';
import { formatIsoToDDMMYYYY, formatFriendlyDate, getRelativeDueDateStatus } from '../utils/dateUtils';
import { Calendar as CalendarIcon, CheckCircle2, Clock, Circle, User, Building, Plus } from 'lucide-react';

interface TaskTimelineViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onUpdateStatus: (id: string, newStatus: TaskStatus) => void;
  onOpenCreateModalWithDate: (dateIso: string) => void;
}

export const TaskTimelineView: React.FC<TaskTimelineViewProps> = ({
  tasks,
  onEditTask,
  onUpdateStatus,
  onOpenCreateModalWithDate,
}) => {
  // Group tasks by date
  const groupedTasks: { [date: string]: Task[] } = {};
  tasks.forEach((t) => {
    const key = t.dueDate || 'nodate';
    if (!groupedTasks[key]) {
      groupedTasks[key] = [];
    }
    groupedTasks[key].push(t);
  });

  // Sort dates chronologically
  const sortedDates = Object.keys(groupedTasks).sort((a, b) => {
    if (a === 'nodate') return 1;
    if (b === 'nodate') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-6">
      {/* Overview header */}
      <div className="bg-[#1c1c1e] border border-[rgba(242,242,242,0.1)] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <h2 className="label-mono text-sm font-bold text-[#f2f2f2]">
            Dòng thời gian tiến độ
          </h2>
          <p className="text-[#f2f2f2]/60 mt-0.5">
            Theo dõi chi tiết các mốc thực hiện và thời hạn bàn giao công việc
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono tabular-nums text-[#d4ff00] font-bold text-base">
            {sortedDates.length}
          </span>
          <span className="text-[#f2f2f2]/60">mốc ngày làm việc</span>
        </div>
      </div>

      <div className="space-y-5">
        {sortedDates.map((dateKey) => {
          const dayTasks = groupedTasks[dateKey];
          const isNoDate = dateKey === 'nodate';
          const friendlyDate = isNoDate ? 'Chưa xác định ngày' : formatFriendlyDate(dateKey);
          const completedCount = dayTasks.filter((t) => t.status === 'Đã hoàn thành').length;
          const dueStatus = !isNoDate ? getRelativeDueDateStatus(dateKey, 'Đang xử lý') : null;

          return (
            <div
              key={dateKey}
              className={`bg-[#1c1c1e] border rounded-lg overflow-hidden transition-all ${
                dueStatus?.type === 'overdue'
                  ? 'border-[#ff4545]/30'
                  : dueStatus?.type === 'today'
                  ? 'border-[#d4ff00]/40'
                  : 'border-[rgba(242,242,242,0.1)]'
              }`}
            >
              {/* Milestone Header */}
              <div className="px-5 py-3.5 bg-white/[0.02] border-b border-[rgba(242,242,242,0.1)] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-4 h-4 text-[#d4ff00]" />
                  <span className="font-semibold text-xs text-[#f2f2f2]">{friendlyDate}</span>

                  {!isNoDate && (
                    <span className="font-mono text-xs text-[#f2f2f2]/50 tabular-nums">
                      ({formatIsoToDDMMYYYY(dateKey)})
                    </span>
                  )}

                  {dueStatus?.type === 'overdue' && (
                    <span className="overdue font-mono text-[11px] font-bold text-[#ff4545]">
                      {dueStatus.label}
                    </span>
                  )}
                  {dueStatus?.type === 'today' && (
                    <span className="font-mono text-[11px] font-bold text-[#d4ff00]">
                      Hôm nay
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs tabular-nums text-[#f2f2f2]/60">
                    <span className="text-[#00ff80] font-bold">{completedCount}</span>/
                    {dayTasks.length} việc hoàn tất
                  </span>

                  {!isNoDate && (
                    <button
                      onClick={() => onOpenCreateModalWithDate(dateKey)}
                      className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[#d4ff00] hover:bg-white/5 rounded transition-colors cursor-pointer"
                      title="Thêm công việc vào ngày này"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm việc</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Tasks List */}
              <div className="divide-y divide-[rgba(242,242,242,0.06)] p-2">
                {dayTasks.map((task) => {
                  const isDone = task.status === 'Đã hoàn thành';

                  return (
                    <div
                      key={task.id}
                      className="p-3 hover:bg-white/[0.02] rounded flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors"
                    >
                      {/* Left: Status Toggle & Info */}
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          onClick={() =>
                            onUpdateStatus(
                              task.id,
                              isDone ? 'Đang xử lý' : 'Đã hoàn thành'
                            )
                          }
                          className="mt-0.5 text-[#f2f2f2]/40 hover:text-[#00ff80] transition-colors cursor-pointer shrink-0"
                          title={isDone ? 'Chuyển về Đang xử lý' : 'Đánh dấu Đã hoàn thành'}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-[#00ff80]" />
                          ) : task.status === 'Đang xử lý' ? (
                            <Clock className="w-4 h-4 text-[#008cff]" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#f2f2f2]/40" />
                          )}
                        </button>

                        <div className="space-y-1">
                          <div
                            onClick={() => onEditTask(task)}
                            className={`text-xs font-semibold cursor-pointer hover:text-[#d4ff00] transition-colors ${
                              isDone ? 'line-through text-[#f2f2f2]/40' : 'text-[#f2f2f2]'
                            }`}
                          >
                            {task.title}
                          </div>

                          {task.description && (
                            <p className="text-[11px] text-[#f2f2f2]/50 line-clamp-1">
                              {task.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#f2f2f2]/60 pt-0.5">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-[#f2f2f2]/40" />
                              {task.assignee}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Building className="w-3 h-3 text-[#f2f2f2]/40" />
                              {task.department}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Priority & Status Pill */}
                      <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
                        {task.priority === 'Cao' && (
                          <span className="priority-cao label-mono font-bold text-[#ff4545]">
                            Cao
                          </span>
                        )}
                        {task.priority === 'Trung bình' && (
                          <span className="label-mono font-medium text-[#f59e0b]">
                            Vừa
                          </span>
                        )}
                        {task.priority === 'Thấp' && (
                          <span className="label-mono text-[#f2f2f2]/40">
                            Thấp
                          </span>
                        )}

                        {task.status === 'Đã hoàn thành' && (
                          <span
                            className="status-pill"
                            style={{ background: 'rgba(0, 255, 128, 0.1)', color: '#00ff80' }}
                          >
                            Đã hoàn thành
                          </span>
                        )}
                        {task.status === 'Đang xử lý' && (
                          <span
                            className="status-pill"
                            style={{ background: 'rgba(0, 140, 255, 0.1)', color: '#008cff' }}
                          >
                            Đang xử lý
                          </span>
                        )}
                        {task.status === 'Chưa bắt đầu' && (
                          <span
                            className="status-pill"
                            style={{ background: 'rgba(242, 242, 242, 0.1)', color: 'rgba(242, 242, 242, 0.7)' }}
                          >
                            Chưa bắt đầu
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

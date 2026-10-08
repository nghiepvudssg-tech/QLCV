import React from 'react';
import { Task, TaskStatus } from '../types/task';
import { formatIsoToDDMMYYYY, getRelativeDueDateStatus } from '../utils/dateUtils';
import {
  CheckCircle2,
  Clock,
  Circle,
  AlertCircle,
  TrendingUp,
  Building2,
  Users2,
  Flame,
  ArrowRight,
  Edit2,
} from 'lucide-react';

interface TaskDashboardViewProps {
  tasks: Task[];
  departments: string[];
  assignees: string[];
  onEditTask: (task: Task) => void;
  onUpdateStatus: (id: string, newStatus: TaskStatus) => void;
}

export const TaskDashboardView: React.FC<TaskDashboardViewProps> = ({
  tasks,
  departments,
  assignees,
  onEditTask,
  onUpdateStatus,
}) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'Đã hoàn thành').length;
  const inProgress = tasks.filter((t) => t.status === 'Đang xử lý').length;
  const notStarted = tasks.filter((t) => t.status === 'Chưa bắt đầu').length;
  const highPriority = tasks.filter((t) => t.priority === 'Cao').length;
  const highUnfinished = tasks.filter((t) => t.priority === 'Cao' && t.status !== 'Đã hoàn thành');

  const percentComplete = total > 0 ? Math.round((completed / total) * 100) : 0;
  const percentInProgress = total > 0 ? Math.round((inProgress / total) * 100) : 0;
  const percentNotStarted = total > 0 ? Math.round((notStarted / total) * 100) : 0;

  // Department statistics
  const deptStats = departments
    .map((dept) => {
      const deptTasks = tasks.filter((t) => t.department === dept);
      const dDone = deptTasks.filter((t) => t.status === 'Đã hoàn thành').length;
      const dProg = deptTasks.filter((t) => t.status === 'Đang xử lý').length;
      const dWait = deptTasks.filter((t) => t.status === 'Chưa bắt đầu').length;
      const pct = deptTasks.length > 0 ? Math.round((dDone / deptTasks.length) * 100) : 0;
      return {
        department: dept,
        total: deptTasks.length,
        done: dDone,
        inProgress: dProg,
        notStarted: dWait,
        percent: pct,
      };
    })
    .filter((d) => d.total > 0);

  // Assignee statistics
  const assigneeStats = assignees
    .map((person) => {
      const pTasks = tasks.filter((t) => t.assignee === person);
      const pDone = pTasks.filter((t) => t.status === 'Đã hoàn thành').length;
      const pProg = pTasks.filter((t) => t.status === 'Đang xử lý').length;
      const pWait = pTasks.filter((t) => t.status === 'Chưa bắt đầu').length;
      const pct = pTasks.length > 0 ? Math.round((pDone / pTasks.length) * 100) : 0;
      return {
        assignee: person,
        total: pTasks.length,
        done: pDone,
        inProgress: pProg,
        notStarted: pWait,
        percent: pct,
      };
    })
    .filter((a) => a.total > 0);

  return (
    <div className="space-y-6">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total & Completion */}
        <div className="bg-[#1c1c1e] border border-[rgba(242,242,242,0.1)] rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="label-mono">Tổng công việc</span>
              <TrendingUp className="w-4 h-4 text-[#d4ff00]" />
            </div>
            <div className="font-mono text-3xl font-bold text-[#f2f2f2] tabular-nums">
              {total}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[rgba(242,242,242,0.08)] flex items-center justify-between text-xs">
            <span className="text-[#f2f2f2]/50">Tiến độ tổng</span>
            <span className="font-mono text-[#d4ff00] font-bold tabular-nums">{percentComplete}%</span>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-[#1c1c1e] border border-[rgba(242,242,242,0.1)] rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="label-mono">Đã hoàn thành</span>
              <CheckCircle2 className="w-4 h-4 text-[#00ff80]" />
            </div>
            <div className="font-mono text-3xl font-bold text-[#00ff80] tabular-nums">
              {completed}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[rgba(242,242,242,0.08)]">
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#00ff80] h-full rounded-full transition-all duration-300"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-[#1c1c1e] border border-[rgba(242,242,242,0.1)] rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="label-mono">Đang xử lý</span>
              <Clock className="w-4 h-4 text-[#008cff]" />
            </div>
            <div className="font-mono text-3xl font-bold text-[#008cff] tabular-nums">
              {inProgress}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[rgba(242,242,242,0.08)]">
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#008cff] h-full rounded-full transition-all duration-300"
                style={{ width: `${percentInProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* High Priority unfinished */}
        <div className="bg-[#1c1c1e] border border-[rgba(242,242,242,0.1)] rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="label-mono text-[#ff4545]/80">Ưu tiên cao chưa xong</span>
              <Flame className="w-4 h-4 text-[#ff4545]" />
            </div>
            <div className="font-mono text-3xl font-bold text-[#ff4545] tabular-nums">
              {highUnfinished.length}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[rgba(242,242,242,0.08)] text-xs text-[#f2f2f2]/50 flex justify-between">
            <span>Tổng việc ưu tiên cao</span>
            <span className="font-mono font-bold text-[#f2f2f2] tabular-nums">{highPriority}</span>
          </div>
        </div>
      </div>

      {/* Grid: Department & Assignee breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Breakdown */}
        <div className="bg-[#1c1c1e] border border-[rgba(242,242,242,0.1)] rounded-lg p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[rgba(242,242,242,0.08)]">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#d4ff00]" />
              <h2 className="label-mono text-xs font-bold text-[#f2f2f2]">
                Tiến độ theo bộ phận
              </h2>
            </div>
            <span className="font-mono text-xs text-[#f2f2f2]/40 tabular-nums">
              {deptStats.length} Đơn vị
            </span>
          </div>

          <div className="space-y-4 flex-1">
            {deptStats.map((d) => (
              <div key={d.department} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#f2f2f2]">{d.department}</span>
                  <div className="flex items-center gap-2 font-mono tabular-nums text-xs">
                    <span className="text-[#00ff80]">{d.done} xong</span>
                    <span className="text-[#f2f2f2]/40">/</span>
                    <span className="text-[#f2f2f2]/70">{d.total} việc</span>
                    <span className="font-bold text-[#d4ff00] ml-1">({d.percent}%)</span>
                  </div>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden flex">
                  <div
                    className="bg-[#00ff80] h-full"
                    style={{ width: `${(d.done / d.total) * 100}%` }}
                    title={`Đã xong: ${d.done}`}
                  />
                  <div
                    className="bg-[#008cff] h-full"
                    style={{ width: `${(d.inProgress / d.total) * 100}%` }}
                    title={`Đang xử lý: ${d.inProgress}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assignee Breakdown */}
        <div className="bg-[#1c1c1e] border border-[rgba(242,242,242,0.1)] rounded-lg p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[rgba(242,242,242,0.08)]">
            <div className="flex items-center gap-2">
              <Users2 className="w-4 h-4 text-[#d4ff00]" />
              <h2 className="label-mono text-xs font-bold text-[#f2f2f2]">
                Khối lượng theo nhân sự
              </h2>
            </div>
            <span className="font-mono text-xs text-[#f2f2f2]/40 tabular-nums">
              {assigneeStats.length} Nhân sự
            </span>
          </div>

          <div className="space-y-4 flex-1">
            {assigneeStats.map((a) => (
              <div key={a.assignee} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#f2f2f2]">{a.assignee}</span>
                  <div className="flex items-center gap-2 font-mono tabular-nums text-xs">
                    <span className="text-[#00ff80]">{a.done} xong</span>
                    <span className="text-[#008cff]">{a.inProgress} xử lý</span>
                    <span className="text-[#f2f2f2]/40">{a.notStarted} chờ</span>
                    <span className="font-bold text-[#d4ff00] ml-1">({a.percent}%)</span>
                  </div>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden flex">
                  <div
                    className="bg-[#00ff80] h-full"
                    style={{ width: `${(a.done / a.total) * 100}%` }}
                  />
                  <div
                    className="bg-[#008cff] h-full"
                    style={{ width: `${(a.inProgress / a.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* High Priority & Overdue Attention Table */}
      {highUnfinished.length > 0 && (
        <div className="bg-[#1c1c1e] border border-[#ff4545]/20 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[rgba(242,242,242,0.08)]">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#ff4545]" />
              <h2 className="label-mono text-xs font-bold text-[#ff4545]">
                Công việc trọng tâm cần theo dõi khẩn cấp
              </h2>
            </div>
            <span className="font-mono text-xs text-[#ff4545] font-bold tabular-nums">
              {highUnfinished.length} Việc chưa hoàn thành
            </span>
          </div>

          <div className="divide-y divide-[rgba(242,242,242,0.08)]">
            {highUnfinished.map((task) => {
              const rel = getRelativeDueDateStatus(task.dueDate, task.status);

              return (
                <div
                  key={task.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-[#f2f2f2] hover:text-[#d4ff00] cursor-pointer" onClick={() => onEditTask(task)}>
                      {task.title}
                    </div>
                    <div className="text-[#f2f2f2]/50 text-[11px] mt-0.5">
                      {task.department} · {task.assignee}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="font-mono text-xs tabular-nums text-right">
                      <div className="text-[#f2f2f2]/80">{formatIsoToDDMMYYYY(task.dueDate)}</div>
                      {rel.type === 'overdue' && (
                        <div className="overdue text-[10px] text-[#ff4545] font-bold">
                          {rel.label}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onUpdateStatus(task.id, 'Đã hoàn thành')}
                      className="px-2.5 py-1 bg-[#00ff80]/15 hover:bg-[#00ff80]/25 text-[#00ff80] border border-[#00ff80]/30 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Đánh dấu xong
                    </button>
                    <button
                      onClick={() => onEditTask(task)}
                      className="p-1 text-[#f2f2f2]/50 hover:text-[#d4ff00] cursor-pointer"
                      title="Sửa công việc"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

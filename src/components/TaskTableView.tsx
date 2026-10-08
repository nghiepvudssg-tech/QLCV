import React, { useState } from 'react';
import { Task, TaskStatus, PriorityLevel, SortField, SortOrder, TaskFilters } from '../types/task';
import { formatIsoToDDMMYYYY, getRelativeDueDateStatus } from '../utils/dateUtils';
import { X } from 'lucide-react';

interface TaskTableViewProps {
  tasks: Task[];
  filters: TaskFilters;
  onFilterChange: (filters: TaskFilters) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onDuplicateTask: (task: Task) => void;
  onUpdateStatus: (id: string, newStatus: TaskStatus) => void;
  onBatchUpdateStatus: (ids: string[], newStatus: TaskStatus) => void;
  onBatchDelete: (ids: string[]) => void;
  departments: string[];
  assignees: string[];
}

export const TaskTableView: React.FC<TaskTableViewProps> = ({
  tasks,
  filters,
  onFilterChange,
  onEditTask,
  onDeleteTask,
  onDuplicateTask,
  onUpdateStatus,
  onBatchUpdateStatus,
  onBatchDelete,
  departments,
  assignees,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Sorting handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const match =
        task.title.toLowerCase().includes(q) ||
        task.assignee.toLowerCase().includes(q) ||
        task.department.toLowerCase().includes(q) ||
        (task.description && task.description.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (filters.department && task.department !== filters.department) {
      return false;
    }
    if (filters.assignee && task.assignee !== filters.assignee) {
      return false;
    }
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }
    if (filters.status && task.status !== filters.status) {
      return false;
    }
    return true;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'dueDate') {
      const dateA = a.dueDate || '';
      const dateB = b.dueDate || '';
      comparison = dateA.localeCompare(dateB);
    } else if (sortField === 'title') {
      comparison = a.title.localeCompare(b.title, 'vi');
    } else if (sortField === 'department') {
      comparison = a.department.localeCompare(b.department, 'vi');
    } else if (sortField === 'assignee') {
      comparison = a.assignee.localeCompare(b.assignee, 'vi');
    } else if (sortField === 'priority') {
      const pWeights: { [key in PriorityLevel]: number } = { Cao: 3, 'Trung bình': 2, Thấp: 1 };
      comparison = pWeights[a.priority] - pWeights[b.priority];
    } else if (sortField === 'status') {
      const sWeights: { [key in TaskStatus]: number } = { 'Chưa bắt đầu': 1, 'Đang xử lý': 2, 'Đã hoàn thành': 3 };
      comparison = sWeights[a.status] - sWeights[b.status];
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(sortedTasks.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const isAllSelected = sortedTasks.length > 0 && selectedIds.length === sortedTasks.length;

  const renderSortIndicator = (field: SortField) => {
    if (sortField === field) {
      return (
        <span className="text-[#d4ff00] font-bold text-xs ml-1">
          {sortOrder === 'asc' ? '↑' : '↓'}
        </span>
      );
    }
    return <span className="text-[#f2f2f2]/30 text-xs ml-1">⇅</span>;
  };

  const completedCount = tasks.filter((t) => t.status === 'Đã hoàn thành').length;
  const inProgressCount = tasks.filter((t) => t.status === 'Đang xử lý').length;
  const notStartedCount = tasks.filter((t) => t.status === 'Chưa bắt đầu').length;

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Controls Container matching screenshot */}
      <div className="flex flex-col gap-4">
        {/* Search input with proper height and no vertical clipping */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Tìm kiếm công việc, người phụ trách..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full bg-[#1c1c1e] border border-[rgba(242,242,242,0.1)] h-11 px-4 text-[#f2f2f2] rounded text-xs focus:outline-none focus:border-[#d4ff00] transition-colors placeholder-[#f2f2f2]/40"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute right-3.5 top-3 text-[#f2f2f2]/40 hover:text-[#f2f2f2] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter dropdowns using custom-select to prevent native clipping */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filters.department}
            onChange={(e) => onFilterChange({ ...filters, department: e.target.value })}
            className="custom-select"
          >
            <option value="">Tất cả bộ phận</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={filters.assignee}
            onChange={(e) => onFilterChange({ ...filters, assignee: e.target.value })}
            className="custom-select"
          >
            <option value="">Tất cả người phụ trách</option>
            {assignees.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          <select
            value={filters.priority}
            onChange={(e) => onFilterChange({ ...filters, priority: e.target.value })}
            className="custom-select"
          >
            <option value="">Mức ưu tiên</option>
            <option value="Cao">Cao</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Thấp">Thấp</option>
          </select>

          {(filters.department || filters.assignee || filters.priority || filters.search || filters.status) && (
            <button
              onClick={() =>
                onFilterChange({
                  search: '',
                  department: '',
                  assignee: '',
                  priority: '',
                  status: '',
                })
              }
              className="px-2.5 py-1 text-xs text-[#f2f2f2]/50 hover:text-[#d4ff00] transition-colors cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Quick status tabs matching screenshot: TẤT CẢ, ĐANG XỬ LÝ, CHƯA BẮT ĐẦU, ĐÃ XONG */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mt-1">
          <button
            onClick={() => onFilterChange({ ...filters, status: '' })}
            className={`label-mono px-3.5 py-2 rounded text-[11px] font-bold tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
              filters.status === ''
                ? 'bg-[rgba(242,242,242,0.15)] text-[#f2f2f2]'
                : 'text-[#f2f2f2]/60 hover:text-[#f2f2f2] hover:bg-white/5'
            }`}
          >
            TẤT CẢ ({tasks.length})
          </button>
          <button
            onClick={() => onFilterChange({ ...filters, status: 'Đang xử lý' })}
            className={`label-mono px-3.5 py-2 rounded text-[11px] font-bold tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
              filters.status === 'Đang xử lý'
                ? 'bg-[rgba(242,242,242,0.15)] text-[#008cff]'
                : 'text-[#f2f2f2]/60 hover:text-[#f2f2f2] hover:bg-white/5'
            }`}
          >
            ĐANG XỬ LÝ ({inProgressCount})
          </button>
          <button
            onClick={() => onFilterChange({ ...filters, status: 'Chưa bắt đầu' })}
            className={`label-mono px-3.5 py-2 rounded text-[11px] font-bold tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
              filters.status === 'Chưa bắt đầu'
                ? 'bg-[rgba(242,242,242,0.15)] text-[#f2f2f2]'
                : 'text-[#f2f2f2]/60 hover:text-[#f2f2f2] hover:bg-white/5'
            }`}
          >
            CHƯA BẮT ĐẦU ({notStartedCount})
          </button>
          <button
            onClick={() => onFilterChange({ ...filters, status: 'Đã hoàn thành' })}
            className={`label-mono px-3.5 py-2 rounded text-[11px] font-bold tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
              filters.status === 'Đã hoàn thành'
                ? 'bg-[rgba(242,242,242,0.15)] text-[#00ff80]'
                : 'text-[#f2f2f2]/60 hover:text-[#f2f2f2] hover:bg-white/5'
            }`}
          >
            ĐÃ XONG ({completedCount})
          </button>
        </div>
      </div>

      {/* Bulk Action Bar (when rows are selected) */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#222226] border border-[#d4ff00]/40 rounded-lg text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[#d4ff00] font-bold">{selectedIds.length}</span>
            <span className="text-[#f2f2f2]/90">công việc đã được chọn</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onBatchUpdateStatus(selectedIds, 'Đã hoàn thành');
                setSelectedIds([]);
              }}
              className="px-3 py-1.5 bg-[#00ff80]/20 hover:bg-[#00ff80]/30 text-[#00ff80] border border-[#00ff80]/30 rounded font-medium transition-colors cursor-pointer"
            >
              Đánh dấu Đã xong
            </button>
            <button
              onClick={() => {
                onBatchUpdateStatus(selectedIds, 'Đang xử lý');
                setSelectedIds([]);
              }}
              className="px-3 py-1.5 bg-[#008cff]/20 hover:bg-[#008cff]/30 text-[#008cff] border border-[#008cff]/30 rounded font-medium transition-colors cursor-pointer"
            >
              Chuyển Đang xử lý
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Xác nhận xóa ${selectedIds.length} công việc đã chọn?`)) {
                  onBatchDelete(selectedIds);
                  setSelectedIds([]);
                }
              }}
              className="px-3 py-1.5 bg-[#ff4545]/20 hover:bg-[#ff4545]/30 text-[#ff4545] border border-[#ff4545]/30 rounded font-medium transition-colors cursor-pointer"
            >
              Xóa đã chọn
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1.5 text-[#f2f2f2]/50 hover:text-[#f2f2f2] cursor-pointer"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* Main Table Container matching screenshot */}
      <div className="table-wrapper bg-[#1c1c1e] border border-[rgba(242,242,242,0.1)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[0.85rem]">
            <thead>
              <tr className="bg-white/[0.02] border-b-[1.5px] border-[rgba(242,242,242,0.1)] select-none">
                <th className="p-4 w-12 text-center align-middle">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    aria-label="Chọn tất cả"
                    className="w-4 h-4 rounded-xs accent-[#d4ff00] cursor-pointer"
                  />
                </th>
                <th
                  onClick={() => handleSort('title')}
                  className="label-mono p-4 text-left cursor-pointer hover:text-[#d4ff00] transition-colors min-w-[280px]"
                >
                  <div className="flex items-center">
                    <span>TASK NAME</span>
                    {renderSortIndicator('title')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('dueDate')}
                  className="label-mono p-4 text-left cursor-pointer hover:text-[#d4ff00] transition-colors min-w-[130px] whitespace-nowrap"
                >
                  <div className="flex items-center">
                    <span>DEADLINE</span>
                    {renderSortIndicator('dueDate')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('assignee')}
                  className="label-mono p-4 text-left cursor-pointer hover:text-[#d4ff00] transition-colors min-w-[140px] whitespace-nowrap"
                >
                  <div className="flex items-center">
                    <span>OWNER</span>
                    {renderSortIndicator('assignee')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('department')}
                  className="label-mono p-4 text-left cursor-pointer hover:text-[#d4ff00] transition-colors min-w-[160px] whitespace-nowrap"
                >
                  <div className="flex items-center">
                    <span>DEPARTMENT</span>
                    {renderSortIndicator('department')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('priority')}
                  className="label-mono p-4 text-left cursor-pointer hover:text-[#d4ff00] transition-colors min-w-[110px] whitespace-nowrap"
                >
                  <div className="flex items-center">
                    <span>PRIORITY</span>
                    {renderSortIndicator('priority')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="label-mono p-4 text-left cursor-pointer hover:text-[#d4ff00] transition-colors min-w-[140px] whitespace-nowrap"
                >
                  <div className="flex items-center">
                    <span>STATUS</span>
                    {renderSortIndicator('status')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[#f2f2f2]/40">
                    <p className="text-sm">Không tìm thấy công việc nào phù hợp với bộ lọc.</p>
                  </td>
                </tr>
              ) : (
                sortedTasks.map((task) => {
                  const isSelected = selectedIds.includes(task.id);
                  const isDone = task.status === 'Đã hoàn thành';
                  const relativeDue = getRelativeDueDateStatus(task.dueDate, task.status);

                  return (
                    <tr
                      key={task.id}
                      className={`border-b border-[rgba(242,242,242,0.1)] transition-colors hover:bg-white/[0.02] ${
                        isSelected ? 'bg-[#d4ff00]/5' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4 text-center align-middle w-12">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(task.id)}
                          aria-label={`Chọn công việc ${task.title}`}
                          className="w-4 h-4 rounded-xs accent-[#d4ff00] cursor-pointer"
                        />
                      </td>

                      {/* Task Name - spacious min-width so titles don't wrap into single words */}
                      <td className="p-4 align-top min-w-[280px]">
                        <div
                          onClick={() => onEditTask(task)}
                          className={`font-semibold cursor-pointer hover:text-[#d4ff00] transition-colors text-xs sm:text-sm leading-snug ${
                            isDone ? 'line-through text-[#f2f2f2]/50' : 'text-[#f2f2f2]'
                          }`}
                        >
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-[11px] text-[#f2f2f2]/60 mt-1 line-clamp-1">
                            {task.description}
                          </div>
                        )}
                      </td>

                      {/* Deadline */}
                      <td className="p-4 align-top font-mono text-xs tabular-nums text-[#f2f2f2]/90 whitespace-nowrap min-w-[130px]">
                        <div>{formatIsoToDDMMYYYY(task.dueDate)}</div>
                        {!isDone && relativeDue.type === 'overdue' && (
                          <div className="overdue text-[#ff4545] font-bold text-[11px] mt-0.5">
                            {relativeDue.label}
                          </div>
                        )}
                        {!isDone && relativeDue.type === 'today' && (
                          <div className="text-[#d4ff00] font-bold text-[11px] mt-0.5">
                            Hôm nay
                          </div>
                        )}
                      </td>

                      {/* Owner */}
                      <td className="p-4 align-top text-xs text-[#f2f2f2]/85 whitespace-nowrap min-w-[140px]">
                        {task.assignee}
                      </td>

                      {/* Department */}
                      <td className="p-4 align-top text-xs text-[#f2f2f2]/70 whitespace-nowrap min-w-[160px]">
                        {task.department}
                      </td>

                      {/* Priority */}
                      <td className="p-4 align-top whitespace-nowrap min-w-[110px]">
                        {task.priority === 'Cao' && (
                          <span className="priority-cao text-[#ff4545] font-bold text-xs">
                            Cao
                          </span>
                        )}
                        {task.priority === 'Trung bình' && (
                          <span className="text-[#f59e0b] font-medium text-xs">
                            Trung bình
                          </span>
                        )}
                        {task.priority === 'Thấp' && (
                          <span className="text-[#f2f2f2]/50 text-xs">
                            Thấp
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4 align-top whitespace-nowrap min-w-[140px]">
                        {task.status === 'Đã hoàn thành' && (
                          <span
                            className="status-pill cursor-pointer"
                            style={{ background: 'rgba(0, 255, 128, 0.1)', color: '#00ff80' }}
                            onClick={() => onUpdateStatus(task.id, 'Đang xử lý')}
                            title="Bấm để chuyển về Đang xử lý"
                          >
                            ĐÃ HOÀN THÀNH
                          </span>
                        )}
                        {task.status === 'Đang xử lý' && (
                          <span
                            className="status-pill cursor-pointer"
                            style={{ background: 'rgba(0, 140, 255, 0.1)', color: '#008cff' }}
                            onClick={() => onUpdateStatus(task.id, 'Đã hoàn thành')}
                            title="Bấm để đánh dấu Hoàn thành"
                          >
                            ĐANG XỬ LÝ
                          </span>
                        )}
                        {task.status === 'Chưa bắt đầu' && (
                          <span
                            className="status-pill cursor-pointer"
                            style={{ background: 'rgba(242, 242, 242, 0.1)', color: 'rgba(242, 242, 242, 0.7)' }}
                            onClick={() => onUpdateStatus(task.id, 'Đang xử lý')}
                            title="Bấm để chuyển sang Đang xử lý"
                          >
                            CHƯA BẮT ĐẦU
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

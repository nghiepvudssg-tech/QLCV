import React from 'react';
import { Menu } from 'lucide-react';

interface HeaderProps {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  onOpenCreateModal: () => void;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalTasks,
  completedTasks,
  overdueTasks,
  onOpenCreateModal,
  onToggleSidebar,
}) => {
  const percentComplete = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <header className="px-6 lg:px-8 py-5 border-b border-[rgba(242,242,242,0.1)] flex items-center justify-between gap-4 bg-[#111113] sticky top-0 z-20">
      <div className="flex items-center gap-6 sm:gap-8">
        {/* Hamburger menu button */}
        <button
          onClick={onToggleSidebar}
          className="p-1.5 -ml-1 text-[#f2f2f2]/80 hover:text-[#f2f2f2] hover:bg-white/5 rounded transition-colors cursor-pointer"
          title="Mở / đóng bảng điều khiển"
          aria-label="Mở bảng điều khiển"
        >
          <Menu className="w-5 h-5 stroke-[2]" />
        </button>

        {/* Stats glance matching screenshot */}
        <div className="stats-glance flex items-center gap-6 sm:gap-8">
          <div className="stat-item flex flex-col">
            <span className="label-mono font-bold">COMPLETED</span>
            <span className="font-mono text-xl sm:text-2xl font-bold text-[#d4ff00] tabular-nums leading-tight">
              {completedTasks}/{totalTasks}
            </span>
          </div>

          <div className="stat-item flex flex-col">
            <span className="label-mono font-bold">PROGRESS</span>
            <span className="font-mono text-xl sm:text-2xl font-bold text-[#d4ff00] tabular-nums leading-tight">
              {percentComplete}%
            </span>
          </div>

          <div className="stat-item flex flex-col">
            <span className="label-mono font-bold text-[#ff4545]/80">OVERDUE</span>
            <span className="font-mono text-xl sm:text-2xl font-bold text-[#ff4545] tabular-nums leading-tight">
              {overdueTasks}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action Button matching screenshot */}
      <button
        onClick={onOpenCreateModal}
        className="btn-primary"
      >
        <span>THÊM CÔNG VIỆC</span>
        <span className="text-sm font-bold leading-none">+</span>
      </button>
    </header>
  );
};

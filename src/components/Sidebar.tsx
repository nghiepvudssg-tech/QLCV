import React from 'react';
import { ViewMode } from '../types/task';
import {
  Table2,
  Kanban,
  BarChart3,
  CalendarDays,
  Download,
  Upload,
  RotateCcw,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onExportCsv: () => void;
  onOpenImportModal: () => void;
  onResetData: () => void;
  isOpen: boolean;
  onClose: () => void;
  departmentsCount: number;
  assigneesCount: number;
  tasksCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  onExportCsv,
  onOpenImportModal,
  onResetData,
  isOpen,
  onClose,
  departmentsCount,
  assigneesCount,
  tasksCount,
}) => {
  return (
    <>
      {/* Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-40 transition-opacity animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-[#1c1c1e] border-r border-[rgba(242,242,242,0.1)] p-6 flex flex-col gap-8 transition-transform duration-200 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-start justify-between">
          <div className="brand">
            <h1 className="font-syne text-2xl font-extrabold tracking-tight leading-none text-[#f2f2f2]">
              WORK<br />DAILY.
            </h1>
            <p className="label-mono mt-1 text-[10px] text-[#f2f2f2]/40 tracking-wider">
              Kế hoạch công việc
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#f2f2f2]/60 hover:text-[#f2f2f2] rounded hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Đóng bảng điều khiển"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Views */}
        <nav className="flex flex-col gap-1.5">
          <div className="label-mono mb-1">Views</div>
          <button
            onClick={() => {
              onViewChange('table');
              onClose();
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs transition-colors cursor-pointer ${
              currentView === 'table'
                ? 'bg-[#d4ff00] text-[#111113] font-semibold shadow-xs'
                : 'text-[#f2f2f2]/70 hover:text-[#f2f2f2] hover:bg-white/5 font-medium'
            }`}
          >
            <Table2 className="w-4 h-4 shrink-0" />
            <span>Bảng chi tiết</span>
          </button>

          <button
            onClick={() => {
              onViewChange('kanban');
              onClose();
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs transition-colors cursor-pointer ${
              currentView === 'kanban'
                ? 'bg-[#d4ff00] text-[#111113] font-semibold shadow-xs'
                : 'text-[#f2f2f2]/70 hover:text-[#f2f2f2] hover:bg-white/5 font-medium'
            }`}
          >
            <Kanban className="w-4 h-4 shrink-0" />
            <span>Bảng tổng hợp</span>
          </button>

          <button
            onClick={() => {
              onViewChange('dashboard');
              onClose();
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs transition-colors cursor-pointer ${
              currentView === 'dashboard'
                ? 'bg-[#d4ff00] text-[#111113] font-semibold shadow-xs'
                : 'text-[#f2f2f2]/70 hover:text-[#f2f2f2] hover:bg-white/5 font-medium'
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span>Thống kê</span>
          </button>

          <button
            onClick={() => {
              onViewChange('timeline');
              onClose();
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs transition-colors cursor-pointer ${
              currentView === 'timeline'
                ? 'bg-[#d4ff00] text-[#111113] font-semibold shadow-xs'
                : 'text-[#f2f2f2]/70 hover:text-[#f2f2f2] hover:bg-white/5 font-medium'
            }`}
          >
            <CalendarDays className="w-4 h-4 shrink-0" />
            <span>Lịch trình</span>
          </button>
        </nav>

        {/* Data Management */}
        <nav className="flex flex-col gap-1.5">
          <div className="label-mono mb-1">Data</div>
          <button
            onClick={() => {
              onExportCsv();
              onClose();
            }}
            className="flex items-center gap-3 px-3 py-2 rounded text-xs text-[#f2f2f2]/70 hover:text-[#f2f2f2] hover:bg-white/5 font-medium transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 shrink-0 text-[#f2f2f2]/50" />
            <span>Xuất CSV</span>
          </button>

          <button
            onClick={() => {
              onOpenImportModal();
              onClose();
            }}
            className="flex items-center gap-3 px-3 py-2 rounded text-xs text-[#f2f2f2]/70 hover:text-[#f2f2f2] hover:bg-white/5 font-medium transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 shrink-0 text-[#f2f2f2]/50" />
            <span>Nhập CSV</span>
          </button>

          <button
            onClick={() => {
              onResetData();
              onClose();
            }}
            className="flex items-center gap-3 px-3 py-2 rounded text-xs text-[#f2f2f2]/70 hover:text-[#f2f2f2] hover:bg-white/5 font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 shrink-0 text-[#f2f2f2]/50" />
            <span>Khôi phục</span>
          </button>
        </nav>

        {/* System & Sync Info */}
        <div className="mt-auto pt-6 border-t border-[rgba(242,242,242,0.08)] flex flex-col gap-2">
          <div className="label-mono">System</div>
          <div className="flex items-center gap-2 text-xs text-[#f2f2f2]/80">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff80] animate-pulse" />
            <span>Synced to Local</span>
          </div>
          <div className="text-[11px] font-mono text-[#f2f2f2]/40 tabular-nums">
            {departmentsCount} Phòng · {assigneesCount} Nhân sự · {tasksCount} Việc
          </div>
        </div>
      </aside>
    </>
  );
};

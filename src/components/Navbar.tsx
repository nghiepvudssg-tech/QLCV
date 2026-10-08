import React from 'react';
import { ViewMode } from '../types/task';
import { Table, Kanban, BarChart3, Calendar, Plus, Download, Upload, RotateCcw } from 'lucide-react';

interface NavbarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onOpenCreateModal: () => void;
  onExportCsv: () => void;
  onOpenImportModal: () => void;
  onResetData: () => void;
  totalTasks: number;
  completedTasks: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  onOpenCreateModal,
  onExportCsv,
  onOpenImportModal,
  onResetData,
  totalTasks,
  completedTasks,
}) => {
  const percentComplete = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              Kế Hoạch Hàng Ngày
            </span>
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 pl-3 border-l border-slate-200">
              <span className="font-mono tabular-nums font-semibold text-slate-700">{completedTasks}/{totalTasks}</span>
              <span>việc hoàn tất</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-emerald-600 font-medium">{percentComplete}%</span>
            </div>
          </div>

          {/* Zone 2: Navigation Links / Segmented View Switcher */}
          <nav className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => onViewChange('table')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                currentView === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5 text-slate-500" />
              <span>Bảng chi tiết</span>
            </button>
            <button
              onClick={() => onViewChange('kanban')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                currentView === 'kanban'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5 text-slate-500" />
              <span>Bảng tổng hợp</span>
            </button>
            <button
              onClick={() => onViewChange('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                currentView === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Thống kê</span>
            </button>
            <button
              onClick={() => onViewChange('timeline')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                currentView === 'timeline'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Lịch trình</span>
            </button>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 border-r border-slate-200 pr-2">
              <button
                onClick={onExportCsv}
                title="Xuất file CSV/Excel hỗ trợ tiếng Việt"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Xuất CSV</span>
              </button>
              <button
                onClick={onOpenImportModal}
                title="Tải lên file CSV dữ liệu công việc"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Nhập CSV</span>
              </button>
              <button
                onClick={onResetData}
                title="Khôi phục lại dữ liệu mẫu gốc ban đầu"
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 active:bg-slate-950 transition-colors whitespace-nowrap shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm công việc</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

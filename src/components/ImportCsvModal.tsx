import React, { useState } from 'react';
import { Task } from '../types/task';
import { parseCsvToTasks } from '../utils/csvUtils';
import { X, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { formatIsoToDDMMYYYY } from '../utils/dateUtils';

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newTasks: Task[], mode: 'append' | 'replace') => void;
}

export const ImportCsvModal: React.FC<ImportCsvModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [csvContent, setCsvContent] = useState('');
  const [parsedTasks, setParsedTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      try {
        const tasks = parseCsvToTasks(text);
        if (tasks.length === 0) {
          setError('Không tìm thấy dòng công việc hợp lệ nào trong file CSV này.');
          setParsedTasks([]);
        } else {
          setParsedTasks(tasks);
          setError(null);
        }
      } catch (err) {
        setError('Lỗi khi đọc file CSV. Vui lòng kiểm tra lại định dạng file.');
        setParsedTasks([]);
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleTextChange = (text: string) => {
    setCsvContent(text);
    if (!text.trim()) {
      setParsedTasks([]);
      setError(null);
      return;
    }
    try {
      const tasks = parseCsvToTasks(text);
      setParsedTasks(tasks);
      if (tasks.length === 0) {
        setError('Không nhận diện được công việc nào từ nội dung dán vào.');
      } else {
        setError(null);
      }
    } catch {
      setError('Định dạng CSV chưa đúng.');
      setParsedTasks([]);
    }
  };

  const handleConfirm = () => {
    if (parsedTasks.length === 0) return;
    onImport(parsedTasks, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="relative bg-[#1c1c1e] text-[#f2f2f2] rounded-xl border border-[rgba(242,242,242,0.15)] max-w-2xl w-full overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(242,242,242,0.1)] bg-white/[0.02]">
          <div>
            <h2 className="font-syne text-lg font-bold text-[#f2f2f2]">
              Nhập Dữ Liệu Từ File CSV / Excel
            </h2>
            <p className="label-mono mt-0.5 text-[10px] text-[#f2f2f2]/50">
              Hỗ trợ nhập danh sách công việc hàng ngày
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#f2f2f2]/50 hover:text-[#f2f2f2] rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* File picker */}
          <div>
            <label className="block label-mono mb-1.5 text-[#f2f2f2]/80">
              Chọn file .csv từ máy tính
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 bg-[#111113] hover:bg-white/5 border border-[rgba(242,242,242,0.15)] rounded cursor-pointer text-[#f2f2f2] font-medium transition-colors w-fit">
                <Upload className="w-4 h-4 text-[#d4ff00]" />
                <span>Chọn tập tin CSV...</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <span className="text-[#f2f2f2]/40 text-[11px]">
                hoặc dán nội dung CSV trực tiếp vào khung dưới
              </span>
            </div>
          </div>

          {/* Paste CSV textarea */}
          <div>
            <label className="block label-mono mb-1.5 text-[#f2f2f2]/80">
              Dán nội dung CSV (tùy chọn)
            </label>
            <textarea
              rows={4}
              value={csvContent}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Tên công việc,Ngày hoàn thành,Bộ phận,Người phụ trách,Mức ưu tiên,Trạng thái,Mô tả chi tiết công việc&#10;Báo cáo kế hoạch,09/10/2026,Kế hoạch Kinh doanh,Nguyễn Anh Tú,Cao,Đang xử lý,..."
              className="w-full font-mono text-[11px] px-3 py-2 bg-[#111113] border border-[rgba(242,242,242,0.15)] text-[#f2f2f2] rounded focus:outline-none focus:border-[#d4ff00] placeholder-[#f2f2f2]/30"
            />
          </div>

          {/* Error notice */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-[#ff4545]/10 border border-[#ff4545]/30 text-[#ff4545] rounded">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Preview */}
          {parsedTasks.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-[#00ff80] flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  Đã nhận diện {parsedTasks.length} công việc
                </span>
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="accent-[#d4ff00] cursor-pointer"
                    />
                    <span>Gộp thêm</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="accent-[#d4ff00] cursor-pointer"
                    />
                    <span>Thay thế tất cả</span>
                  </label>
                </div>
              </div>

              {/* Mini preview table */}
              <div className="max-h-40 overflow-y-auto border border-[rgba(242,242,242,0.1)] rounded bg-[#111113]">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-white/[0.04] text-[#f2f2f2]/60 font-medium border-b border-[rgba(242,242,242,0.1)] sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Tên việc</th>
                      <th className="py-2 px-3">Hạn</th>
                      <th className="py-2 px-3">Bộ phận</th>
                      <th className="py-2 px-3">Phụ trách</th>
                      <th className="py-2 px-3">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(242,242,242,0.06)]">
                    {parsedTasks.slice(0, 5).map((t, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="py-1.5 px-3 truncate max-w-[150px] font-medium text-[#f2f2f2]">{t.title}</td>
                        <td className="py-1.5 px-3 font-mono tabular-nums whitespace-nowrap text-[#f2f2f2]/80">{formatIsoToDDMMYYYY(t.dueDate)}</td>
                        <td className="py-1.5 px-3 truncate max-w-[100px] text-[#f2f2f2]/60">{t.department}</td>
                        <td className="py-1.5 px-3 whitespace-nowrap text-[#f2f2f2]/80">{t.assignee}</td>
                        <td className="py-1.5 px-3 whitespace-nowrap text-[#f2f2f2]/70">{t.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedTasks.length > 5 && (
                <p className="text-[11px] text-[#f2f2f2]/40 italic">
                  ...và còn {parsedTasks.length - 5} công việc khác sẽ được nhập.
                </p>
              )}
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[rgba(242,242,242,0.1)]">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#f2f2f2]/60 hover:text-[#f2f2f2] transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              disabled={parsedTasks.length === 0}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Xác nhận nhập dữ liệu ({parsedTasks.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

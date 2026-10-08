import React, { useState, useEffect } from 'react';
import { Task, PriorityLevel, TaskStatus } from '../types/task';
import { X, Calendar, User, Building, AlertCircle, FileText } from 'lucide-react';
import { formatIsoToDDMMYYYY } from '../utils/dateUtils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => void;
  taskToEdit?: Task | null;
  departments: string[];
  assignees: string[];
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  departments,
  assignees,
}) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [department, setDepartment] = useState('');
  const [customDept, setCustomDept] = useState('');
  const [assignee, setAssignee] = useState('');
  const [customAssignee, setCustomAssignee] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('Trung bình');
  const [status, setStatus] = useState<TaskStatus>('Chưa bắt đầu');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDueDate(taskToEdit.dueDate || '');
      if (departments.includes(taskToEdit.department)) {
        setDepartment(taskToEdit.department);
        setCustomDept('');
      } else {
        setDepartment('__custom__');
        setCustomDept(taskToEdit.department);
      }

      if (assignees.includes(taskToEdit.assignee)) {
        setAssignee(taskToEdit.assignee);
        setCustomAssignee('');
      } else {
        setAssignee('__custom__');
        setCustomAssignee(taskToEdit.assignee);
      }

      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setDescription(taskToEdit.description || '');
    } else {
      // Defaults for new task
      setTitle('');
      const now = new Date();
      const defaultDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
      setDueDate(defaultDate);
      setDepartment(departments[0] || 'Kỹ thuật Nghiệp vụ');
      setCustomDept('');
      setAssignee(assignees[0] || 'Hoàng Kim Sinh');
      setCustomAssignee('');
      setPriority('Trung bình');
      setStatus('Chưa bắt đầu');
      setDescription('');
    }
    setErrors({});
  }, [taskToEdit, isOpen, departments, assignees]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) {
      newErrors.title = 'Vui lòng nhập tên công việc';
    }
    if (department === '__custom__' && !customDept.trim()) {
      newErrors.department = 'Vui lòng nhập tên bộ phận';
    }
    if (assignee === '__custom__' && !customAssignee.trim()) {
      newErrors.assignee = 'Vui lòng nhập tên người phụ trách';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalDept = department === '__custom__' ? customDept.trim() : department;
    const finalAssignee = assignee === '__custom__' ? customAssignee.trim() : assignee;

    onSave(
      {
        title: title.trim(),
        dueDate,
        department: finalDept,
        assignee: finalAssignee,
        priority,
        status,
        description: description.trim(),
      },
      taskToEdit?.id ? taskToEdit.id : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#1c1c1e] text-[#f2f2f2] border border-[rgba(242,242,242,0.15)] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(242,242,242,0.1)] bg-white/[0.02]">
          <div>
            <h2 className="font-syne text-lg font-bold text-[#f2f2f2]">
              {taskToEdit?.id ? 'Chỉnh Sửa Công Việc' : 'Thêm Công Việc Mới'}
            </h2>
            <p className="label-mono mt-0.5 text-[10px] text-[#f2f2f2]/50">
              {taskToEdit?.id ? 'Cập nhật nội dung & hạn chót' : 'Tạo mới nhiệm vụ hàng ngày'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#f2f2f2]/50 hover:text-[#f2f2f2] rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block label-mono mb-1.5 text-[#f2f2f2]/80">
              Tên công việc <span className="text-[#ff4545]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Báo cáo tồn tại TTB theo phiên vụ..."
              className={`w-full px-3 py-2 bg-[#111113] border rounded text-xs text-[#f2f2f2] focus:outline-none focus:border-[#d4ff00] transition-colors placeholder-[#f2f2f2]/30 ${
                errors.title ? 'border-[#ff4545]' : 'border-[rgba(242,242,242,0.15)]'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-[11px] text-[#ff4545] flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.title}</span>
              </p>
            )}
          </div>

          {/* Due date */}
          <div>
            <label className="block label-mono mb-1.5 text-[#f2f2f2]/80">
              Hạn chót hoàn thành (Deadline)
            </label>
            <div className="relative">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#111113] border border-[rgba(242,242,242,0.15)] rounded text-xs text-[#f2f2f2] focus:outline-none focus:border-[#d4ff00] font-mono tabular-nums transition-colors [color-scheme:dark]"
              />
            </div>
            {dueDate && (
              <p className="mt-1 font-mono text-[11px] text-[#f2f2f2]/50">
                Hiển thị: {formatIsoToDDMMYYYY(dueDate)}
              </p>
            )}
          </div>

          {/* Department & Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block label-mono mb-1.5 text-[#f2f2f2]/80">
                Bộ phận phụ trách
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-[#111113] border border-[rgba(242,242,242,0.15)] rounded text-xs text-[#f2f2f2] focus:outline-none focus:border-[#d4ff00]"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
                <option value="__custom__">+ Thêm bộ phận mới...</option>
              </select>

              {department === '__custom__' && (
                <input
                  type="text"
                  placeholder="Nhập tên bộ phận mới..."
                  value={customDept}
                  onChange={(e) => setCustomDept(e.target.value)}
                  className="mt-2 w-full px-3 py-2 bg-[#111113] border border-[rgba(242,242,242,0.2)] rounded text-xs text-[#f2f2f2] focus:outline-none focus:border-[#d4ff00]"
                />
              )}
            </div>

            <div>
              <label className="block label-mono mb-1.5 text-[#f2f2f2]/80">
                Người phụ trách
              </label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full px-3 py-2 bg-[#111113] border border-[rgba(242,242,242,0.15)] rounded text-xs text-[#f2f2f2] focus:outline-none focus:border-[#d4ff00]"
              >
                {assignees.map((person) => (
                  <option key={person} value={person}>
                    {person}
                  </option>
                ))}
                <option value="__custom__">+ Thêm nhân sự mới...</option>
              </select>

              {assignee === '__custom__' && (
                <input
                  type="text"
                  placeholder="Nhập tên nhân sự mới..."
                  value={customAssignee}
                  onChange={(e) => setCustomAssignee(e.target.value)}
                  className="mt-2 w-full px-3 py-2 bg-[#111113] border border-[rgba(242,242,242,0.2)] rounded text-xs text-[#f2f2f2] focus:outline-none focus:border-[#d4ff00]"
                />
              )}
            </div>
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block label-mono mb-1.5 text-[#f2f2f2]/80">
                Mức độ ưu tiên
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 bg-[#111113] border border-[rgba(242,242,242,0.15)] rounded text-xs text-[#f2f2f2] focus:outline-none focus:border-[#d4ff00]"
              >
                <option value="Cao">Cao</option>
                <option value="Trung bình">Trung bình</option>
                <option value="Thấp">Thấp</option>
              </select>
            </div>

            <div>
              <label className="block label-mono mb-1.5 text-[#f2f2f2]/80">
                Trạng thái tiến độ
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 bg-[#111113] border border-[rgba(242,242,242,0.15)] rounded text-xs text-[#f2f2f2] focus:outline-none focus:border-[#d4ff00]"
              >
                <option value="Chưa bắt đầu">Chưa bắt đầu</option>
                <option value="Đang xử lý">Đang xử lý</option>
                <option value="Đã hoàn thành">Đã hoàn thành</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block label-mono mb-1.5 text-[#f2f2f2]/80">
              Mô tả chi tiết / Ghi chú
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả nội dung công việc, tài liệu đính kèm hoặc kết quả cần đạt..."
              className="w-full px-3 py-2 bg-[#111113] border border-[rgba(242,242,242,0.15)] rounded text-xs text-[#f2f2f2] focus:outline-none focus:border-[#d4ff00] transition-colors placeholder-[#f2f2f2]/30"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-[rgba(242,242,242,0.1)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#f2f2f2]/60 hover:text-[#f2f2f2] font-medium transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {taskToEdit?.id ? 'Lưu thay đổi' : 'Tạo công việc'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

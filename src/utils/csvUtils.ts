import { Task, PriorityLevel, TaskStatus } from '../types/task';
import { formatIsoToDDMMYYYY, parseDDMMYYYYtoIso } from './dateUtils';

// Helper to escape CSV cell value
function escapeCsvCell(value: string | undefined): string {
  if (value === undefined || value === null) return '""';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Export tasks to CSV with UTF-8 BOM
export function exportTasksToCsv(tasks: Task[]): void {
  const headers = [
    'Tên công việc',
    'Ngày hoàn thành',
    'Bộ phận',
    'Người phụ trách',
    'Mức ưu tiên',
    'Trạng thái',
    'Mô tả chi tiết công việc',
  ];

  const rows = tasks.map((task) => [
    escapeCsvCell(task.title),
    escapeCsvCell(formatIsoToDDMMYYYY(task.dueDate)),
    escapeCsvCell(task.department),
    escapeCsvCell(task.assignee),
    escapeCsvCell(task.priority),
    escapeCsvCell(task.status),
    escapeCsvCell(task.description || ''),
  ]);

  const csvContent =
    '\uFEFF' + // UTF-8 BOM for Excel Vietnamese support
    [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const now = new Date();
  const dateStr = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
  link.setAttribute('href', url);
  link.setAttribute('download', `ke_hoach_cong_viec_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Simple robust CSV line splitter that respects quoted fields
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Parse CSV text into Task array
export function parseCsvToTasks(csvText: string): Task[] {
  const cleanText = csvText.replace(/^\uFEFF/, ''); // strip BOM if present
  const lines = cleanText.split(/\r?\n/).filter((l) => l.trim().length > 0);

  if (lines.length === 0) return [];

  // Find header index: look for line containing 'Tên công việc' or headers
  let headerIndex = -1;
  let headers: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const parsed = parseCsvLine(lines[i]);
    if (parsed.some((col) => col.toLowerCase().includes('tên công việc') || col.toLowerCase().includes('công việc'))) {
      headerIndex = i;
      headers = parsed.map((h) => h.toLowerCase().trim());
      break;
    }
  }

  // If no header found, assume standard format starting at line 0
  let startIndex = 0;
  if (headerIndex !== -1) {
    startIndex = headerIndex + 1;
  }

  const tasks: Task[] = [];
  const titleIdx = headers.findIndex((h) => h.includes('tên công việc') || h.includes('công việc'));
  const dateIdx = headers.findIndex((h) => h.includes('ngày') || h.includes('hoàn thành'));
  const deptIdx = headers.findIndex((h) => h.includes('bộ phận') || h.includes('phòng'));
  const assigneeIdx = headers.findIndex((h) => h.includes('người') || h.includes('phụ trách'));
  const priorityIdx = headers.findIndex((h) => h.includes('ưu tiên'));
  const statusIdx = headers.findIndex((h) => h.includes('trạng thái'));
  const descIdx = headers.findIndex((h) => h.includes('mô tả') || h.includes('chi tiết'));

  for (let i = startIndex; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    // Skip empty lines or pure commas
    if (cols.every((c) => !c || c.trim() === '')) continue;

    const title = titleIdx !== -1 ? cols[titleIdx] : cols[0] || '';
    if (!title) continue;

    const rawDate = dateIdx !== -1 ? cols[dateIdx] : cols[1] || '';
    const rawDept = deptIdx !== -1 ? cols[deptIdx] : cols[2] || '';
    const rawAssignee = assigneeIdx !== -1 ? cols[assigneeIdx] : cols[3] || '';
    const rawPriority = priorityIdx !== -1 ? cols[priorityIdx] : cols[4] || '';
    const rawStatus = statusIdx !== -1 ? cols[statusIdx] : cols[5] || '';
    const rawDesc = descIdx !== -1 ? cols[descIdx] : cols[6] || '';

    // Normalize priority
    let priority: PriorityLevel = 'Trung bình';
    const pLower = (rawPriority || '').toLowerCase();
    if (pLower.includes('cao')) priority = 'Cao';
    else if (pLower.includes('thấp')) priority = 'Thấp';
    else if (pLower.includes('trung')) priority = 'Trung bình';

    // Normalize status
    let status: TaskStatus = 'Chưa bắt đầu';
    const sLower = (rawStatus || '').toLowerCase();
    if (sLower.includes('đã hoàn thành') || sLower.includes('xong') || sLower.includes('hoàn thành')) {
      status = 'Đã hoàn thành';
    } else if (sLower.includes('đang') || sLower.includes('tiến hành') || sLower.includes('xử lý')) {
      status = 'Đang xử lý';
    } else {
      status = 'Chưa bắt đầu';
    }

    const dueDateIso = rawDate.includes('/') ? parseDDMMYYYYtoIso(rawDate) : rawDate;

    tasks.push({
      id: `task-imported-${Date.now()}-${i}`,
      title: title.trim(),
      dueDate: dueDateIso,
      department: rawDept.trim() || 'Chưa phân loại',
      assignee: rawAssignee.trim() || 'Chưa phân công',
      priority,
      status,
      description: rawDesc.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return tasks;
}

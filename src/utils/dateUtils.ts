/**
 * Date utility helpers for Vietnamese daily task planner
 */

// Converts DD/MM/YYYY to YYYY-MM-DD (for HTML date inputs & ISO sorting)
export function parseDDMMYYYYtoIso(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.trim().split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return dateStr;
}

// Converts YYYY-MM-DD to DD/MM/YYYY (for display & CSV)
export function formatIsoToDDMMYYYY(isoStr: string): string {
  if (!isoStr) return '';
  const parts = isoStr.trim().split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    return `${day}/${month}/${year}`;
  }
  // If already in DD/MM/YYYY
  if (isoStr.includes('/')) return isoStr;
  return isoStr;
}

// Format date for friendly Vietnamese display (e.g., "Thứ Năm, 08/10/2026")
export function formatFriendlyDate(dateStr: string): string {
  const iso = dateStr.includes('/') ? parseDDMMYYYYtoIso(dateStr) : dateStr;
  if (!iso) return 'Chưa đặt hạn';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return formatIsoToDDMMYYYY(dateStr);
    const dayOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][d.getDay()];
    return `${dayOfWeek}, ${formatIsoToDDMMYYYY(iso)}`;
  } catch {
    return formatIsoToDDMMYYYY(dateStr);
  }
}

// Reference current date for relative comparison
// We use current system date or default reference 2026-10-08
export function getRelativeDueDateStatus(dueDateStr: string, status: string): {
  type: 'completed' | 'overdue' | 'today' | 'upcoming' | 'none';
  label: string;
} {
  if (status === 'Đã hoàn thành') {
    return { type: 'completed', label: 'Đã hoàn thành' };
  }
  if (!dueDateStr) {
    return { type: 'none', label: 'Không có hạn' };
  }

  const iso = dueDateStr.includes('/') ? parseDDMMYYYYtoIso(dueDateStr) : dueDateStr;
  const target = new Date(iso + 'T00:00:00');
  if (isNaN(target.getTime())) return { type: 'none', label: '' };

  const now = new Date();
  // Strip time for accurate day comparisons
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  const diffTime = targetDay.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { type: 'overdue', label: `Quá hạn ${Math.abs(diffDays)} ngày` };
  } else if (diffDays === 0) {
    return { type: 'today', label: 'Hạn chót hôm nay' };
  } else if (diffDays <= 3) {
    return { type: 'upcoming', label: `Còn ${diffDays} ngày` };
  } else {
    return { type: 'upcoming', label: `Còn ${diffDays} ngày` };
  }
}

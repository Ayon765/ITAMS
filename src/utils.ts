/**
 * Reusable utility to format a date string or Date object into DD/MM/YYYY format.
 */
export const formatDate = (dateValue?: string | Date | null): string => {
  if (!dateValue) return '';
  
  if (dateValue instanceof Date) {
    const day = String(dateValue.getDate()).padStart(2, '0');
    const month = String(dateValue.getMonth() + 1).padStart(2, '0');
    const year = dateValue.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Handle ISO string / YYYY-MM-DD format
  const match = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }

  // Handle full ISO timestamp (e.g. 2026-07-03T22:11:00-07:00 or similar)
  if (dateValue.includes('T')) {
    const datePart = dateValue.split('T')[0];
    const matchPart = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (matchPart) {
      return `${matchPart[3]}/${matchPart[2]}/${matchPart[1]}`;
    }
  }

  // Fallback for general date parsing
  try {
    const d = new Date(dateValue);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch (e) {
    // Ignore and fallback to original
  }

  return dateValue;
};

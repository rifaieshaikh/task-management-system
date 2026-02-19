import { format, parseISO, isValid, formatDistanceToNow } from 'date-fns';

/**
 * Format ISO date string to readable format
 */
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Invalid date';
    return format(date, 'MMM dd, yyyy');
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Format ISO datetime string to readable format
 */
export const formatDateTime = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Invalid date';
    return format(date, 'MMM dd, yyyy HH:mm');
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Invalid date';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Format date for input field (YYYY-MM-DD)
 */
export const formatDateForInput = (dateString: string | null): string => {
  if (!dateString) return '';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return '';
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    return '';
  }
};

/**
 * Check if a date is overdue
 */
export const isOverdue = (dueDateString: string | null, isCompleted: boolean): boolean => {
  if (!dueDateString || isCompleted) return false;
  
  try {
    const dueDate = parseISO(dueDateString);
    if (!isValid(dueDate)) return false;
    return dueDate < new Date();
  } catch (error) {
    return false;
  }
};

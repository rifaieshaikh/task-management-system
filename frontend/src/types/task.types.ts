/**
 * Task entity type matching backend TaskResponseDTO
 */
export interface Task {
  id: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  dueDate: string | null; // ISO 8601 date string
  createdAt: string; // ISO 8601 datetime string
  updatedAt: string; // ISO 8601 datetime string
}

/**
 * Task creation/update request type matching backend TaskRequestDTO
 */
export interface TaskRequest {
  title: string;
  description?: string | null;
  isCompleted?: boolean;
  dueDate?: string | null; // ISO 8601 date string
}

/**
 * Paginated response from backend
 */
export interface PagedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

/**
 * Error response from backend
 */
export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

/**
 * Task filter options
 */
export interface TaskFilters {
  search?: string;
  isCompleted?: boolean | null;
  page?: number;
  size?: number;
  sort?: string;
  sortBy?: SortField;
  sortDirection?: SortDirection;
}

/**
 * Sort options for tasks
 */
export type SortField = 'title' | 'dueDate' | 'createdAt' | 'updatedAt';
export type SortDirection = 'asc' | 'desc';

export interface TaskSort {
  field: SortField;
  direction: SortDirection;
}

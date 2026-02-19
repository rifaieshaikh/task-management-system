import axiosInstance from './axiosConfig';
import { Task, TaskRequest, PagedResponse, TaskFilters } from '../types/task.types';

/**
 * Task API service for all backend communication
 */
class TaskApi {
  private readonly basePath = '/tasks';

  /**
   * Get all tasks with optional filters, pagination, and sorting
   */
  async getTasks(filters?: TaskFilters): Promise<PagedResponse<Task>> {
    const params = new URLSearchParams();

    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.isCompleted !== undefined && filters?.isCompleted !== null) {
      params.append('isCompleted', String(filters.isCompleted));
    }
    if (filters?.page !== undefined) {
      params.append('page', String(filters.page));
    }
    if (filters?.size !== undefined) {
      params.append('size', String(filters.size));
    }
    if (filters?.sort) {
      params.append('sort', filters.sort);
    }

    const response = await axiosInstance.get<PagedResponse<Task>>(
      `${this.basePath}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get a single task by ID
   */
  async getTaskById(id: number): Promise<Task> {
    const response = await axiosInstance.get<Task>(`${this.basePath}/${id}`);
    return response.data;
  }

  /**
   * Create a new task
   */
  async createTask(task: TaskRequest): Promise<Task> {
    const response = await axiosInstance.post<Task>(this.basePath, task);
    return response.data;
  }

  /**
   * Update an existing task
   */
  async updateTask(id: number, task: TaskRequest): Promise<Task> {
    const response = await axiosInstance.put<Task>(`${this.basePath}/${id}`, task);
    return response.data;
  }

  /**
   * Toggle task completion status
   */
  async toggleTaskCompletion(id: number): Promise<Task> {
    const response = await axiosInstance.patch<Task>(`${this.basePath}/${id}/toggle`);
    return response.data;
  }

  /**
   * Delete a task
   */
  async deleteTask(id: number): Promise<void> {
    await axiosInstance.delete(`${this.basePath}/${id}`);
  }

  /**
   * Search tasks by keyword
   */
  async searchTasks(
    search: string,
    page: number = 0,
    size: number = 10,
    sort?: string
  ): Promise<PagedResponse<Task>> {
    return this.getTasks({ search, page, size, sort });
  }

  /**
   * Get tasks filtered by completion status
   */
  async getTasksByStatus(
    isCompleted: boolean,
    page: number = 0,
    size: number = 10,
    sort?: string
  ): Promise<PagedResponse<Task>> {
    return this.getTasks({ isCompleted, page, size, sort });
  }
}

// Export singleton instance
export const taskApi = new TaskApi();
export default taskApi;

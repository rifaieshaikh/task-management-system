import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task, TaskRequest, PagedResponse, TaskFilters } from '../../types/task.types';
import taskApi from '../../api/taskApi';
import { AxiosError } from 'axios';

/**
 * Task state interface
 */
interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  filters: TaskFilters;
}

/**
 * Initial state
 */
const initialState: TaskState = {
  tasks: [],
  currentTask: null,
  totalPages: 0,
  totalElements: 0,
  currentPage: 0,
  pageSize: 10,
  loading: false,
  error: null,
  filters: {
    search: '',
    isCompleted: null,
    page: 0,
    size: 10,
    sort: 'createdAt,desc',
  },
};

/**
 * Async thunk to fetch all tasks
 */
export const fetchTasks = createAsyncThunk<
  PagedResponse<Task>,
  TaskFilters | undefined,
  { rejectValue: string }
>('tasks/fetchTasks', async (filters, { rejectWithValue }) => {
  try {
    const response = await taskApi.getTasks(filters);
    return response;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      axiosError.response?.data?.message || 'Failed to fetch tasks'
    );
  }
});

/**
 * Async thunk to fetch a single task by ID
 */
export const fetchTaskById = createAsyncThunk<
  Task,
  number,
  { rejectValue: string }
>('tasks/fetchTaskById', async (id, { rejectWithValue }) => {
  try {
    const response = await taskApi.getTaskById(id);
    return response;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      axiosError.response?.data?.message || 'Failed to fetch task'
    );
  }
});

/**
 * Async thunk to create a new task
 */
export const createTask = createAsyncThunk<
  Task,
  TaskRequest,
  { rejectValue: string }
>('tasks/createTask', async (task, { rejectWithValue }) => {
  try {
    const response = await taskApi.createTask(task);
    return response;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      axiosError.response?.data?.message || 'Failed to create task'
    );
  }
});

/**
 * Async thunk to update an existing task
 */
export const updateTask = createAsyncThunk<
  Task,
  { id: number; task: TaskRequest },
  { rejectValue: string }
>('tasks/updateTask', async ({ id, task }, { rejectWithValue }) => {
  try {
    const response = await taskApi.updateTask(id, task);
    return response;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      axiosError.response?.data?.message || 'Failed to update task'
    );
  }
});

/**
 * Async thunk to toggle task completion
 */
export const toggleTaskCompletion = createAsyncThunk<
  Task,
  number,
  { rejectValue: string }
>('tasks/toggleTaskCompletion', async (id, { rejectWithValue }) => {
  try {
    const response = await taskApi.toggleTaskCompletion(id);
    return response;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      axiosError.response?.data?.message || 'Failed to toggle task completion'
    );
  }
});

/**
 * Async thunk to delete a task
 */
export const deleteTask = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>('tasks/deleteTask', async (id, { rejectWithValue }) => {
  try {
    await taskApi.deleteTask(id);
    return id;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      axiosError.response?.data?.message || 'Failed to delete task'
    );
  }
});

/**
 * Task slice
 */
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<TaskFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.content;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.currentPage = action.payload.number;
        state.pageSize = action.payload.size;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch tasks';
      });

    // Fetch task by ID
    builder
      .addCase(fetchTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch task';
      });

    // Create task
    builder
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.unshift(action.payload);
        state.totalElements += 1;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create task';
      });

    // Update task
    builder
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update task';
      });

    // Toggle task completion
    builder
      .addCase(toggleTaskCompletion.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleTaskCompletion.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(toggleTaskCompletion.rejected, (state, action) => {
        state.error = action.payload || 'Failed to toggle task completion';
      });

    // Delete task
    builder
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter((t) => t.id !== action.payload);
        state.totalElements -= 1;
        if (state.currentTask?.id === action.payload) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete task';
      });
  },
});

export const { setFilters, clearCurrentTask, clearError } = taskSlice.actions;
export default taskSlice.reducer;

# Frontend Implementation Guide

This guide covers the React TypeScript frontend implementation with Redux and Material-UI.

---

## Phase 4: Frontend Setup

### Step 4.1: Initialize React Project

```bash
cd frontend
npx create-react-app . --template typescript
```

### Step 4.2: Install Dependencies

```bash
npm install @reduxjs/toolkit react-redux react-router-dom
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
npm install axios date-fns
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev @playwright/test
```

### Step 4.3: Update package.json Scripts

**File**: [`frontend/package.json`](frontend/package.json) (add to scripts section)

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "test:coverage": "react-scripts test --coverage --watchAll=false",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "eject": "react-scripts eject"
  }
}
```

---

## Phase 5: Frontend Core Implementation

### Step 5.1: Create Type Definitions

**File**: [`frontend/src/types/task.types.ts`](frontend/src/types/task.types.ts)

```typescript
export interface Task {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  isCompleted: boolean;
  dueDate: string | null;
}

export interface TaskFilters {
  completed: boolean | null;
  search: string;
  sortBy: 'title' | 'dueDate' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface TasksState {
  items: Task[];
  currentTask: Task | null;
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  filters: TaskFilters;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}
```

### Step 5.2: Create API Configuration

**File**: [`frontend/src/api/axiosConfig.ts`](frontend/src/api/axiosConfig.ts)

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      const errorMessage = error.response.data?.message || 'An error occurred';
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // Request made but no response
      return Promise.reject(new Error('No response from server'));
    } else {
      // Something else happened
      return Promise.reject(error);
    }
  }
);

export default axiosInstance;
```

**File**: [`frontend/src/api/taskApi.ts`](frontend/src/api/taskApi.ts)

```typescript
import axiosInstance from './axiosConfig';
import { Task, TaskFormData, PageResponse } from '../types/task.types';

export const taskApi = {
  // Get all tasks with filters
  getTasks: async (
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: string = 'desc',
    completed?: boolean | null,
    search?: string
  ): Promise<PageResponse<Task>> => {
    const params: any = { page, size, sortBy, sortOrder };
    if (completed !== null && completed !== undefined) {
      params.completed = completed;
    }
    if (search) {
      params.search = search;
    }
    const response = await axiosInstance.get('/tasks', { params });
    return response.data;
  },

  // Get task by ID
  getTaskById: async (id: number): Promise<Task> => {
    const response = await axiosInstance.get(`/tasks/${id}`);
    return response.data;
  },

  // Create new task
  createTask: async (taskData: TaskFormData): Promise<Task> => {
    const response = await axiosInstance.post('/tasks', taskData);
    return response.data;
  },

  // Update task
  updateTask: async (id: number, taskData: TaskFormData): Promise<Task> => {
    const response = await axiosInstance.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  // Toggle task completion
  toggleTaskCompletion: async (id: number): Promise<Task> => {
    const response = await axiosInstance.patch(`/tasks/${id}/toggle`);
    return response.data;
  },

  // Delete task
  deleteTask: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/tasks/${id}`);
  },
};
```

### Step 5.3: Create Redux Store

**File**: [`frontend/src/store/store.ts`](frontend/src/store/store.ts)

```typescript
import { configureStore } from '@reduxjs/toolkit';
import taskReducer from './slices/taskSlice';

export const store = configureStore({
  reducer: {
    tasks: taskReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**File**: [`frontend/src/store/hooks.ts`](frontend/src/store/hooks.ts)

```typescript
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

**File**: [`frontend/src/store/slices/taskSlice.ts`](frontend/src/store/slices/taskSlice.ts)

```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { taskApi } from '../../api/taskApi';
import { Task, TaskFormData, TasksState, TaskFilters } from '../../types/task.types';

const initialState: TasksState = {
  items: [],
  currentTask: null,
  loading: false,
  error: null,
  pagination: {
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  },
  filters: {
    completed: null,
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
};

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { tasks: TasksState };
      const { pagination, filters } = state.tasks;
      
      const response = await taskApi.getTasks(
        pagination.page,
        pagination.size,
        filters.sortBy,
        filters.sortOrder,
        filters.completed,
        filters.search
      );
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (id: number, { rejectWithValue }) => {
    try {
      const task = await taskApi.getTaskById(id);
      return task;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: TaskFormData, { rejectWithValue }) => {
    try {
      const task = await taskApi.createTask(taskData);
      return task;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, taskData }: { id: number; taskData: TaskFormData }, { rejectWithValue }) => {
    try {
      const task = await taskApi.updateTask(id, taskData);
      return task;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleTaskCompletion = createAsyncThunk(
  'tasks/toggleTaskCompletion',
  async (id: number, { rejectWithValue }) => {
    try {
      const task = await taskApi.toggleTaskCompletion(id);
      return task;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: number, { rejectWithValue }) => {
    try {
      await taskApi.deleteTask(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<TaskFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 0; // Reset to first page when filters change
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pagination.size = action.payload;
      state.pagination.page = 0;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
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
        state.items = action.payload.content;
        state.pagination = {
          page: action.payload.pageable.pageNumber,
          size: action.payload.pageable.pageSize,
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
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
        state.error = action.payload as string;
      });

    // Create task
    builder
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update task
    builder
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((task) => task.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.currentTask = action.payload;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Toggle task completion
    builder
      .addCase(toggleTaskCompletion.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleTaskCompletion.fulfilled, (state, action) => {
        const index = state.items.findIndex((task) => task.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(toggleTaskCompletion.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete task
    builder
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((task) => task.id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, setPage, setPageSize, clearError, clearCurrentTask } = taskSlice.actions;
export default taskSlice.reducer;
```

### Step 5.4: Create Utility Functions

**File**: [`frontend/src/utils/dateUtils.ts`](frontend/src/utils/dateUtils.ts)

```typescript
import { format, parseISO, isValid } from 'date-fns';

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'No due date';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Invalid date';
    return format(date, 'MMM dd, yyyy');
  } catch {
    return 'Invalid date';
  }
};

export const formatDateTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Invalid date';
    return format(date, 'MMM dd, yyyy HH:mm');
  } catch {
    return 'Invalid date';
  }
};

export const isOverdue = (dueDate: string | null): boolean => {
  if (!dueDate) return false;
  
  try {
    const date = parseISO(dueDate);
    return isValid(date) && date < new Date();
  } catch {
    return false;
  }
};
```

### Step 5.5: Create Common Components

**File**: [`frontend/src/components/common/Loading.tsx`](frontend/src/components/common/Loading.tsx)

```typescript
import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const Loading: React.FC = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="200px"
    >
      <CircularProgress />
    </Box>
  );
};

export default Loading;
```

**File**: [`frontend/src/components/common/ErrorMessage.tsx`](frontend/src/components/common/ErrorMessage.tsx)

```typescript
import React from 'react';
import { Alert, AlertTitle } from '@mui/material';

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose }) => {
  return (
    <Alert severity="error" onClose={onClose} sx={{ mb: 2 }}>
      <AlertTitle>Error</AlertTitle>
      {message}
    </Alert>
  );
};

export default ErrorMessage;
```

**File**: [`frontend/src/components/common/ConfirmDialog.tsx`](frontend/src/components/common/ConfirmDialog.tsx)

```typescript
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
```

### Step 5.6: Create TaskList Components

**File**: [`frontend/src/components/TaskList/TaskFilters.tsx`](frontend/src/components/TaskList/TaskFilters.tsx)

```typescript
import React from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Grid,
} from '@mui/material';
import { TaskFilters as TaskFiltersType } from '../../types/task.types';

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onFilterChange: (filters: Partial<TaskFiltersType>) => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({ filters, onFilterChange }) => {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ search: event.target.value });
  };

  const handleCompletedChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    onFilterChange({
      completed: value === 'all' ? null : value === 'true',
    });
  };

  const handleSortByChange = (event: SelectChangeEvent<string>) => {
    onFilterChange({ sortBy: event.target.value as any });
  };

  const handleSortOrderChange = (event: SelectChangeEvent<string>) => {
    onFilterChange({ sortOrder: event.target.value as 'asc' | 'desc' });
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Search tasks"
            variant="outlined"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search by title or description"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={
                filters.completed === null
                  ? 'all'
                  : filters.completed
                  ? 'true'
                  : 'false'
              }
              label="Status"
              onChange={handleCompletedChange}
            >
              <MenuItem value="all">All Tasks</MenuItem>
              <MenuItem value="false">Active</MenuItem>
              <MenuItem value="true">Completed</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={filters.sortBy}
              label="Sort By"
              onChange={handleSortByChange}
            >
              <MenuItem value="createdAt">Created Date</MenuItem>
              <MenuItem value="dueDate">Due Date</MenuItem>
              <MenuItem value="title">Title</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Order</InputLabel>
            <Select
              value={filters.sortOrder}
              label="Order"
              onChange={handleSortOrderChange}
            >
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskFilters;
```

**File**: [`frontend/src/components/TaskList/TaskListItem.tsx`](frontend/src/components/TaskList/TaskListItem.tsx)

```typescript
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Checkbox,
  IconButton,
  Box,
  Chip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Task } from '../../types/task.types';
import { formatDate, isOverdue } from '../../utils/dateUtils';

interface TaskListItemProps {
  task: Task;
  onToggle: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const TaskListItem: React.FC<TaskListItemProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const overdue = isOverdue(task.dueDate) && !task.isCompleted;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center">
          <Checkbox
            checked={task.isCompleted}
            onChange={() => onToggle(task.id)}
            color="primary"
          />
          <Box flexGrow={1} ml={2}>
            <Typography
              variant="h6"
              sx={{
                textDecoration: task.isCompleted ? 'line-through' : 'none',
                color: task.isCompleted ? 'text.secondary' : 'text.primary',
              }}
            >
              {task.title}
            </Typography>
            {task.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {task.description}
              </Typography>
            )}
            <Box mt={1} display="flex" gap={1} alignItems="center">
              {task.dueDate && (
                <Chip
                  label={formatDate(task.dueDate)}
                  size="small"
                  color={overdue ? 'error' : 'default'}
                />
              )}
              <Chip
                label={task.isCompleted ? 'Completed' : 'Active'}
                size="small"
                color={task.isCompleted ? 'success' : 'primary'}
              />
            </Box>
          </Box>
          <Box>
            <IconButton onClick={() => onEdit(task.id)} color="primary">
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => onDelete(task.id)} color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskListItem;
```

**File**: [`frontend/src/components/TaskList/TaskList.tsx`](frontend/src/components/TaskList/TaskList.tsx)

```typescript
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Pagination,
  Paper,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchTasks,
  toggleTaskCompletion,
  deleteTask,
  setFilters,
  setPage,
  clearError,
} from '../../store/slices/taskSlice';
import TaskListItem from './TaskListItem';
import TaskFilters from './TaskFilters';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import ConfirmDialog from '../common/ConfirmDialog';

const TaskList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, loading, error, pagination, filters } = useAppSelector(
    (state) => state.tasks
  );

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch, pagination.page, pagination.size, filters]);

  const handleToggle = (id: number) => {
    dispatch(toggleTaskCompletion(id));
  };

  const handleEdit = (id: number) => {
    navigate(`/tasks/${id}/edit`);
  };

  const handleDeleteClick = (id: number) => {
    setTaskToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      dispatch(deleteTask(taskToDelete));
    }
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const handleFilterChange = (newFilters: any) => {
    dispatch(setFilters(newFilters));
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    dispatch(setPage(page - 1)); // MUI Pagination is 1-indexed
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Task Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/tasks/new')}
        >
          Add Task
        </Button>
      </Box>

      {error && (
        <ErrorMessage message={error} onClose={() => dispatch(clearError())} />
      )}

      <TaskFilters filters={filters} onFilterChange={handleFilterChange} />

      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No tasks found. Create your first task!
          </Typography>
        </Paper>
      ) : (
        <>
          {items.map((task) => (
            <TaskListItem
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          ))}

          {pagination.totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.page + 1}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Container>
  );
};

export default TaskList;
```

### Step 5.7: Create TaskForm Component

**File**: [`frontend/src/components/TaskForm/TaskForm.tsx`](frontend/src/components/TaskForm/TaskForm.tsx)

```typescript
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Paper,
  Typography,
} from '@mui/material';
import { Task, TaskFormData } from '../../types/task.types';

interface TaskFormProps {
  initialData?: Task;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    isCompleted: false,
    dueDate: null,
  });

  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        isCompleted: initialData.isCompleted,
        dueDate: initialData.dueDate,
      });
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: any = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must not exceed 200 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (
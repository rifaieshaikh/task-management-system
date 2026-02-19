import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Button,
  Stack,
  SelectChangeEvent,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchTasks,
  toggleTaskCompletion,
  deleteTask,
} from '../../store/slices/taskSlice';
import { Task, TaskFilters, SortField, SortDirection } from '../../types/task.types';
import TaskItem from './TaskItem';
import Loading from '../common/Loading';
import ErrorAlert from '../common/ErrorAlert';

interface TaskListProps {
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ onAddTask, onEditTask }) => {
  const dispatch = useAppDispatch();
  const { tasks, loading, error, totalPages } = useAppSelector(
    (state) => state.tasks
  );

  const [filters, setFilters] = useState<TaskFilters>({
    page: 0,
    size: 10,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    dispatch(fetchTasks(filters));
  }, [dispatch, filters]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);

    // Debounce search
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: value || undefined,
        page: 0,
      }));
    }, 500);

    setSearchTimeout(timeout);
  };

  const handleCompletedFilterChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setFilters((prev) => ({
      ...prev,
      isCompleted: value === 'all' ? undefined : value === 'true',
      page: 0,
    }));
  };

  const handleSortChange = (event: SelectChangeEvent<SortField>) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: event.target.value as SortField,
      page: 0,
    }));
  };

  const handleSortDirectionChange = (event: SelectChangeEvent<SortDirection>) => {
    setFilters((prev) => ({
      ...prev,
      sortDirection: event.target.value as SortDirection,
      page: 0,
    }));
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setFilters((prev) => ({
      ...prev,
      page: page - 1,
    }));
  };

  const handleToggleComplete = (id: number) => {
    dispatch(toggleTaskCompletion(id));
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTask(id));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Task Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddTask}
        >
          Add Task
        </Button>
      </Box>

      <Stack spacing={2} mb={3}>
        <TextField
          fullWidth
          label="Search tasks"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by title or description..."
        />

        <Box display="flex" gap={2} flexWrap="wrap">
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={
                filters.isCompleted === undefined
                  ? 'all'
                  : filters.isCompleted
                  ? 'true'
                  : 'false'
              }
              label="Status"
              onChange={handleCompletedFilterChange}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="false">Pending</MenuItem>
              <MenuItem value="true">Completed</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={filters.sortBy}
              label="Sort By"
              onChange={handleSortChange}
            >
              <MenuItem value="createdAt">Created Date</MenuItem>
              <MenuItem value="updatedAt">Updated Date</MenuItem>
              <MenuItem value="dueDate">Due Date</MenuItem>
              <MenuItem value="title">Title</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Order</InputLabel>
            <Select
              value={filters.sortDirection}
              label="Order"
              onChange={handleSortDirectionChange}
            >
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Stack>

      {error && <ErrorAlert message={error} />}

      {loading ? (
        <Loading />
      ) : tasks.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            No tasks found. Create your first task to get started!
          </Typography>
        </Box>
      ) : (
        <>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onEdit={onEditTask}
              onDelete={handleDelete}
            />
          ))}

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={(filters.page ?? 0) + 1}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default TaskList;

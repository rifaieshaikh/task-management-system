import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store/store';
import theme from './theme/theme';
import TaskList from './components/TaskList/TaskList';
import TaskForm from './components/TaskForm/TaskForm';
import { Task, TaskRequest } from './types/task.types';
import { useAppDispatch } from './store/hooks';
import { createTask, updateTask } from './store/slices/taskSlice';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleAddTask = () => {
    setEditingTask(null);
    setFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingTask(null);
  };

  const handleSubmitForm = async (taskData: TaskRequest) => {
    try {
      if (editingTask) {
        await dispatch(updateTask({ id: editingTask.id, task: taskData })).unwrap();
      } else {
        await dispatch(createTask(taskData)).unwrap();
      }
      handleCloseForm();
    } catch (error) {
      // Error is handled by Redux slice and displayed in UI
      console.error('Failed to save task:', error);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <TaskList onAddTask={handleAddTask} onEditTask={handleEditTask} />
      <TaskForm
        open={formOpen}
        task={editingTask}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
      />
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
};

export default App;

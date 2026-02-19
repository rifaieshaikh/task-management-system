import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, Typography, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import theme from './theme/theme';
import TaskList from './components/TaskList/TaskList';
import TaskForm from './components/TaskForm/TaskForm';
import ErrorBoundary from './components/common/ErrorBoundary';
import { Task } from './types/task.types';

function App() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const handleAddTask = () => {
    setEditingTask(undefined);
    setFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingTask(undefined);
  };

  const handleSubmitForm = () => {
    setFormOpen(false);
    setEditingTask(undefined);
  };

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            bgcolor: 'background.default',
            py: 4,
          }}
        >
          <Container maxWidth="lg">
            <Box mb={4} textAlign="center">
              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                color="primary"
                fontWeight="bold"
              >
                Task Management System
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Organize your tasks efficiently
              </Typography>
            </Box>

            <ErrorBoundary
              fallback={
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color="error" gutterBottom>
                    Failed to load tasks
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Please refresh the page to try again
                  </Typography>
                </Box>
              }
            >
              <TaskList onAddTask={handleAddTask} onEditTask={handleEditTask} />
            </ErrorBoundary>

            <TaskForm
              open={formOpen}
              task={editingTask}
              onClose={handleCloseForm}
              onSubmit={handleSubmitForm}
            />

            <Fab
              color="primary"
              aria-label="add task"
              onClick={handleAddTask}
              sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
              }}
            >
              <AddIcon />
            </Fab>
          </Container>
        </Box>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

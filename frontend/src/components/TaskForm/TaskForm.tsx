import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Box,
} from '@mui/material';
import { Task, TaskRequest } from '../../types/task.types';
import { formatDateForInput } from '../../utils/dateUtils';

interface TaskFormProps {
  open: boolean;
  task?: Task | null;
  onClose: () => void;
  onSubmit: (taskData: TaskRequest) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ open, task, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<TaskRequest>({
    title: '',
    description: null,
    isCompleted: false,
    dueDate: null,
  });

  const [errors, setErrors] = useState<{
    title?: string;
    dueDate?: string;
  }>({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        isCompleted: task.isCompleted,
        dueDate: task.dueDate,
      });
    } else {
      setFormData({
        title: '',
        description: null,
        isCompleted: false,
        dueDate: null,
      });
    }
    setErrors({});
  }, [task, open]);

  const validate = (): boolean => {
    const newErrors: { title?: string; dueDate?: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      if (isNaN(dueDate.getTime())) {
        newErrors.dueDate = 'Invalid date format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = event.target;
    const checked = (event.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value || null,
    }));

    // Clear error for the field being edited
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              name="title"
              label="Title"
              value={formData.title}
              onChange={handleChange}
              error={!!errors.title}
              helperText={errors.title}
              required
              fullWidth
              autoFocus
            />

            <TextField
              name="description"
              label="Description"
              value={formData.description || ''}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
            />

            <TextField
              name="dueDate"
              label="Due Date"
              type="date"
              value={formatDateForInput(formData.dueDate ?? null)}
              onChange={handleChange}
              error={!!errors.dueDate}
              helperText={errors.dueDate}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />

            <FormControlLabel
              control={
                <Checkbox
                  name="isCompleted"
                  checked={formData.isCompleted}
                  onChange={handleChange}
                />
              }
              label="Mark as completed"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {task ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskForm;

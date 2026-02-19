import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Checkbox,
  IconButton,
  Chip,
  Box,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Task } from '../../types/task.types';
import { formatDate, isOverdue } from '../../utils/dateUtils';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const overdue = isOverdue(task.dueDate, task.isCompleted);

  return (
    <Card
      sx={{
        mb: 2,
        opacity: task.isCompleted ? 0.7 : 1,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 3,
        },
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Checkbox
            checked={task.isCompleted}
            onChange={() => onToggleComplete(task.id)}
            sx={{ mt: -1 }}
          />
          <Box flex={1}>
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
                sx={{ mt: 1 }}
              >
                {task.description}
              </Typography>
            )}
            <Box display="flex" gap={1} mt={2} flexWrap="wrap">
              <Chip
                label={task.isCompleted ? 'Completed' : 'Pending'}
                color={task.isCompleted ? 'success' : 'default'}
                size="small"
              />
              {task.dueDate && (
                <Chip
                  label={`Due: ${formatDate(task.dueDate)}`}
                  color={overdue ? 'error' : 'default'}
                  size="small"
                />
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
        <IconButton
          size="small"
          color="primary"
          onClick={() => onEdit(task)}
          aria-label="edit task"
        >
          <EditIcon />
        </IconButton>
        <IconButton
          size="small"
          color="error"
          onClick={() => onDelete(task.id)}
          aria-label="delete task"
        >
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default TaskItem;

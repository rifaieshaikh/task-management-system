import React from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';

interface ErrorAlertProps {
  message: string;
  onClose?: () => void;
}

/**
 * Error alert component for displaying error messages
 */
const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onClose }) => {
  return (
    <Box mb={2}>
      <Alert severity="error" onClose={onClose}>
        <AlertTitle>Error</AlertTitle>
        {message}
      </Alert>
    </Box>
  );
};

export default ErrorAlert;

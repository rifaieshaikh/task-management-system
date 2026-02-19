# Task Management System - Frontend

A modern React TypeScript frontend application for task management with Material-UI components, Redux state management, and comprehensive features.

## 🚀 Features

- ✅ **Full CRUD Operations**: Create, read, update, and delete tasks
- 🔍 **Advanced Search**: Real-time search across task titles and descriptions
- 🎯 **Smart Filtering**: Filter tasks by completion status
- 📊 **Flexible Sorting**: Sort by creation date, update date, due date, or title
- 📄 **Pagination**: Efficient handling of large task lists
- 🎨 **Material-UI Design**: Modern, responsive UI with custom theming
- 🔄 **Redux State Management**: Centralized state with Redux Toolkit
- 📱 **Responsive Layout**: Works seamlessly on desktop and mobile devices
- ⚡ **Real-time Updates**: Instant UI updates with optimistic rendering
- 🎭 **Form Validation**: Client-side validation for data integrity
- 🚨 **Error Handling**: User-friendly error messages and alerts

## 📋 Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Backend API**: Running on `http://localhost:8080` (or configure via `.env`)

## 🛠️ Installation

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create a `.env` file in the frontend directory:

```bash
cp .env.example .env
```

Edit `.env` to configure the API endpoint:

```env
REACT_APP_API_BASE_URL=http://localhost:8080
```

## 🏃 Running the Application

### Development Mode

Start the development server with hot reload:

```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

### Production Build

Build the application for production:

```bash
npm run build
```

The optimized build will be in the `build/` directory.

### Preview Production Build

Serve the production build locally:

```bash
npm install -g serve
serve -s build -p 3000
```

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t task-management-frontend .
```

### Run Docker Container

```bash
docker run -p 80:80 task-management-frontend
```

Access the application at [http://localhost](http://localhost)

### Docker Compose (Full Stack)

From the project root directory:

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database on port 5432
- Backend API on port 8080
- Frontend on port 3000

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
│   ├── index.html         # HTML template
│   ├── favicon.ico        # App icon
│   └── manifest.json      # PWA manifest
├── src/
│   ├── api/               # API service layer
│   │   ├── axiosConfig.ts # Axios configuration
│   │   └── taskApi.ts     # Task API methods
│   ├── components/        # React components
│   │   ├── common/        # Reusable components
│   │   │   ├── ErrorAlert.tsx
│   │   │   └── Loading.tsx
│   │   ├── TaskList/      # Task list components
│   │   │   ├── TaskItem.tsx
│   │   │   └── TaskList.tsx
│   │   └── TaskForm/      # Task form components
│   │       └── TaskForm.tsx
│   ├── store/             # Redux store
│   │   ├── store.ts       # Store configuration
│   │   ├── hooks.ts       # Typed Redux hooks
│   │   └── slices/        # Redux slices
│   │       └── taskSlice.ts
│   ├── theme/             # Material-UI theme
│   │   └── theme.ts       # Theme configuration
│   ├── types/             # TypeScript types
│   │   └── task.types.ts  # Task-related types
│   ├── utils/             # Utility functions
│   │   └── dateUtils.ts   # Date formatting utilities
│   ├── App.tsx            # Root component
│   ├── index.tsx          # Application entry point
│   └── index.css          # Global styles
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
├── Dockerfile            # Docker configuration
├── nginx.conf            # Nginx configuration for production
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

## 🎨 Component Overview

### TaskList Component

Main component displaying the list of tasks with:
- Search bar for filtering tasks
- Status filter (All/Pending/Completed)
- Sort options (by date, title)
- Pagination controls
- Add Task button

**Location**: `src/components/TaskList/TaskList.tsx`

### TaskItem Component

Individual task card displaying:
- Checkbox for completion toggle
- Task title and description
- Due date with overdue indicator
- Edit and Delete action buttons

**Location**: `src/components/TaskList/TaskItem.tsx`

### TaskForm Component

Modal form for creating/editing tasks:
- Title input (required, max 200 chars)
- Description textarea (optional)
- Due date picker
- Completion status checkbox
- Form validation

**Location**: `src/components/TaskForm/TaskForm.tsx`

### Common Components

- **Loading**: Centered loading spinner for async operations
- **ErrorAlert**: Error message display with dismiss option

**Location**: `src/components/common/`

## 🔄 State Management

### Redux Store Structure

```typescript
{
  tasks: {
    tasks: Task[],           // Array of tasks
    loading: boolean,        // Loading state
    error: string | null,    // Error message
    totalPages: number,      // Total pages for pagination
    totalElements: number    // Total number of tasks
  }
}
```

### Available Actions

- `fetchTasks`: Load tasks with filters
- `fetchTaskById`: Load a single task
- `createTask`: Create a new task
- `updateTask`: Update an existing task
- `toggleTaskCompletion`: Toggle task completion status
- `deleteTask`: Delete a task

**Location**: `src/store/slices/taskSlice.ts`

## 🌐 API Integration

### API Service

The `TaskApi` class provides methods for all backend operations:

```typescript
// Fetch tasks with filters
taskApi.getTasks({ 
  search: 'keyword',
  isCompleted: false,
  page: 0,
  size: 10,
  sort: 'createdAt,desc'
})

// Create a task
taskApi.createTask({
  title: 'New Task',
  description: 'Task description',
  dueDate: '2024-12-31'
})

// Update a task
taskApi.updateTask(taskId, updatedData)

// Toggle completion
taskApi.toggleTaskCompletion(taskId)

// Delete a task
taskApi.deleteTask(taskId)
```

**Location**: `src/api/taskApi.ts`

### Axios Configuration

- Base URL from environment variables
- Request/response interceptors for logging
- Error handling with user-friendly messages
- Automatic JSON serialization

**Location**: `src/api/axiosConfig.ts`

## 🎯 TypeScript Types

### Core Types

```typescript
// Task entity
interface Task {
  id: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// Task creation/update
interface TaskRequest {
  title: string;
  description?: string | null;
  isCompleted?: boolean;
  dueDate?: string | null;
}

// Pagination response
interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  // ... other pagination fields
}
```

**Location**: `src/types/task.types.ts`

## 🎨 Theming

### Custom Theme

The application uses a custom Material-UI theme with:
- Primary color: Blue (#1976d2)
- Secondary color: Purple (#9c27b0)
- Custom typography
- Rounded corners (8px)
- Button text transform disabled

**Location**: `src/theme/theme.ts`

### Customization

To modify the theme, edit `src/theme/theme.ts`:

```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#your-color',
    },
  },
  // ... other theme options
});
```

## 🛠️ Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

### `npm run eject`
⚠️ **One-way operation**: Ejects from Create React App

## 🧪 Testing

### Run Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

### Test Structure

```
src/
├── components/
│   └── __tests__/
│       ├── TaskList.test.tsx
│       ├── TaskItem.test.tsx
│       └── TaskForm.test.tsx
└── store/
    └── slices/
        └── __tests__/
            └── taskSlice.test.ts
```

## 🐛 Troubleshooting

### Issue: API Connection Failed

**Solution**: Ensure the backend is running and the API URL is correct in `.env`

```bash
# Check backend status
curl http://localhost:8080/api/tasks

# Verify .env configuration
cat .env
```

### Issue: CORS Errors

**Solution**: The backend must allow requests from the frontend origin. Check backend CORS configuration.

### Issue: Build Fails

**Solution**: Clear cache and reinstall dependencies

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Port Already in Use

**Solution**: Change the port or kill the process using it

```bash
# Use a different port
PORT=3001 npm start

# Or kill the process on port 3000
lsof -ti:3000 | xargs kill -9
```

## 📊 Performance Optimization

### Implemented Optimizations

1. **Code Splitting**: Automatic with Create React App
2. **Lazy Loading**: Components loaded on demand
3. **Memoization**: React.memo for expensive components
4. **Debounced Search**: 500ms delay to reduce API calls
5. **Pagination**: Load only required data
6. **Production Build**: Minified and optimized

### Best Practices

- Use `useCallback` for event handlers
- Use `useMemo` for expensive calculations
- Implement virtual scrolling for large lists
- Optimize images and assets
- Enable gzip compression in production

## 🔒 Security

### Implemented Security Measures

1. **XSS Protection**: React's built-in escaping
2. **HTTPS**: Recommended for production
3. **Environment Variables**: Sensitive data in `.env`
4. **Input Validation**: Client-side validation
5. **CORS**: Configured in backend
6. **Security Headers**: Set in Nginx configuration

### Security Headers (Production)

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

## 🚀 Deployment

### Netlify

```bash
npm run build
# Deploy the build/ directory
```

### Vercel

```bash
npm install -g vercel
vercel --prod
```

### AWS S3 + CloudFront

```bash
npm run build
aws s3 sync build/ s3://your-bucket-name
```

### Nginx (Self-hosted)

```bash
npm run build
sudo cp -r build/* /var/www/html/
sudo systemctl restart nginx
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_BASE_URL` | Backend API base URL | `http://localhost:8080` |
| `PORT` | Development server port | `3000` |
| `BROWSER` | Auto-open browser | `true` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Development Team** - Initial work

## 🙏 Acknowledgments

- React team for the amazing framework
- Material-UI for the component library
- Redux team for state management
- Create React App for the build setup

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**Happy Task Managing! 🎉**

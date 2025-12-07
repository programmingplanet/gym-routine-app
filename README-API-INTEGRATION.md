# API Integration Guide

This document explains how the gym routine app integrates with the backend API.

## Configuration

The app supports two modes:
1. **Local Storage Mode** (default): All data is stored in browser localStorage
2. **API Mode**: Data is fetched from and saved to the backend API

### Environment Variables

Create a `.env.local` file based on `.env.example`:

```bash
# Enable API mode
NEXT_PUBLIC_USE_API=true

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Authentication

### Login Flow

When `NEXT_PUBLIC_USE_API=true`, the login process works as follows:

1. User enters username and password
2. App sends POST request to `/users/login` with credentials
3. Backend returns:
   - `access_token`: JWT token for authentication
   - `token_type`: Usually "Bearer"
   - `user_id`: User's unique identifier
   - `username`: User's username

4. App stores the token in localStorage as `auth_token`
5. All subsequent API requests include the token in the `Authorization` header

### API Request Headers

All authenticated requests include:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

## API Endpoints

### Users
- **POST** `/users/login` - Login user
- **GET** `/users/` - List all users
- **POST** `/users/` - Create user
- **GET** `/users/{user_id}` - Get user details
- **PUT** `/users/{user_id}` - Update user
- **DELETE** `/users/{user_id}` - Delete user

### Exercises
- **GET** `/exercises/` - List all exercises
- **POST** `/exercises/` - Create exercise
- **GET** `/exercises/user/{user_id}` - List user's exercises
- **GET** `/exercises/shared/{user_id}` - List exercises shared with user
- **GET** `/exercises/{exercise_id}` - Get exercise details
- **PUT** `/exercises/{exercise_id}` - Update exercise
- **DELETE** `/exercises/{exercise_id}` - Delete exercise

### Routines
- **POST** `/routines/` - Create routine
- **GET** `/routines/user/{user_id}` - List user's routines
- **GET** `/routines/{routine_id}` - Get routine details
- **PUT** `/routines/{routine_id}` - Update routine
- **DELETE** `/routines/{routine_id}` - Delete routine

### Progress
- **POST** `/progress/` - Create progress entry
- **GET** `/progress/user/{user_id}` - List user's progress
- **GET** `/progress/exercise/{exercise_id}` - List progress for exercise
- **GET** `/progress/{progress_id}` - Get progress details
- **DELETE** `/progress/{progress_id}` - Delete progress

### Workout Sessions
- **POST** `/workout-sessions/` - Create workout session
- **GET** `/workout-sessions/user/{user_id}` - List user's sessions
- **GET** `/workout-sessions/{session_id}` - Get session details
- **PUT** `/workout-sessions/{session_id}` - Update session
- **DELETE** `/workout-sessions/{session_id}` - Delete session

## Data Models

### User
```typescript
{
  id: string;
  username: string;
  password?: string; // Only sent during creation, never returned
  name: string;
}
```

### Exercise
```typescript
{
  id: string;
  name: string;
  imageUrl: string;
  muscleGroup: string;
  description?: string;
  createdBy?: string;
  isShared?: boolean;
  sharedWith?: string[];
  equipment?: string[];
  createdAt?: string;
}
```

### Routine
```typescript
{
  id: string;
  userId: string;
  dayNumber: number;
  dayName: string;
  exercises: RoutineExercise[];
  completed?: boolean;
  lastCompletedDate?: string;
  isCustom?: boolean;
  createdAt?: string;
}
```

### Progress
```typescript
{
  id: string;
  userId: string;
  exerciseId: string;
  routineId: string;
  date: string;
  weight: number;
  reps: number;
  sets: number;
  notes?: string;
}
```

### WorkoutSession
```typescript
{
  id: string;
  userId: string;
  routineId: string;
  date: string;
  completed: boolean;
  progress: Progress[];
}
```

## Fallback Mode

If API requests fail or `NEXT_PUBLIC_USE_API=false`, the app automatically falls back to localStorage mode. This ensures the app remains functional even if the backend is unavailable.

## Error Handling

All API calls are wrapped in try-catch blocks:
- Errors are logged to console
- User-friendly error messages are displayed
- App falls back to safe defaults (empty arrays, null values)

## Testing the Integration

1. Start the backend API server (ensure it's running on the configured URL)
2. Set `NEXT_PUBLIC_USE_API=true` in your `.env.local`
3. Restart the Next.js development server
4. Test login functionality
5. Verify API requests in browser DevTools Network tab
6. Check that authorization headers are included in requests

## Migration from localStorage to API

When switching from localStorage to API mode:
1. Export data from localStorage if needed
2. Import data to the backend database
3. Enable API mode in environment variables
4. Test all functionality to ensure seamless transition

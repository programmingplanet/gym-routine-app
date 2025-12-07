import { User, Routine, Progress, WorkoutSession, Exercise, LoginResponse } from '@/types';
import { users } from '@/data/users';
import { routines } from '@/data/routines';
import { exercisesCatalog } from '@/data/exercises';

// API configuration
// Use Next.js API routes which will proxy to FastAPI backend
const API_BASE_URL = '/api';  // Next.js API routes
const USE_API = process.env.NEXT_PUBLIC_USE_API === 'true';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

// Helper function to make authenticated API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `API Error: ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

export const api = {
  // Autenticación
  async login(username: string, password: string): Promise<User | null> {
    if (USE_API) {
      try {
        const response = await apiCall<LoginResponse>('/users/login', {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        });

        // Store auth token and user info
        localStorage.setItem('auth_token', response.access_token);

        const user: User = {
          id: response.user_id,
          username: response.username,
          name: response.username, // Using username as name since API doesn't return name in login
        };

        localStorage.setItem('user', JSON.stringify(user));
        return user;
      } catch (error) {
        console.error('Login error:', error);
        return null;
      }
    } else {
      // Fallback to local data
      const user = users.find(
        u => u.username === username && u.password === password
      );
      if (user) {
        const { password, ...userWithoutPassword } = user;
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        return userWithoutPassword as User;
      }
      return null;
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
  },

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Ejercicios
  async getExercises(userId?: string): Promise<Exercise[]> {
    if (USE_API) {
      try {
        if (userId) {
          // Get user-specific exercises and shared exercises
          const [userExercises, sharedExercises] = await Promise.all([
            apiCall<Exercise[]>(`/exercises/user/${userId}`),
            apiCall<Exercise[]>(`/exercises/shared/${userId}`)
          ]);
          return [...userExercises, ...sharedExercises];
        }
        return apiCall<Exercise[]>('/exercises/');
      } catch (error) {
        console.error('Get exercises error:', error);
        return [];
      }
    } else {
      // Fallback to local data
      const customExercises = this.getCustomExercisesFromStorage();
      if (userId) {
        // Return user's own exercises + system exercises + public shared exercises
        const userExercises = customExercises.filter(e =>
          e.createdBy === userId || e.isShared
        );
        return [...exercisesCatalog, ...userExercises];
      }
      return [...exercisesCatalog, ...customExercises];
    }
  },

  async getExerciseById(exerciseId: string): Promise<Exercise | undefined> {
    if (USE_API) {
      try {
        return apiCall<Exercise>(`/exercises/${exerciseId}`);
      } catch (error) {
        console.error('Get exercise error:', error);
        return undefined;
      }
    } else {
      // Fallback to local data
      const customExercises = this.getCustomExercisesFromStorage();
      return exercisesCatalog.find(e => e.id === exerciseId) ||
             customExercises.find(e => e.id === exerciseId);
    }
  },

  async createExercise(exercise: Omit<Exercise, 'id' | 'createdAt'>): Promise<Exercise> {
    if (USE_API) {
      try {
        return apiCall<Exercise>('/exercises/', {
          method: 'POST',
          body: JSON.stringify(exercise),
        });
      } catch (error) {
        console.error('Create exercise error:', error);
        throw error;
      }
    } else {
      // Fallback to local data
      const newExercise: Exercise = {
        id: `custom-ex-${Date.now()}-${Math.random()}`,
        createdAt: new Date().toISOString(),
        ...exercise
      };

      const customExercises = this.getCustomExercisesFromStorage();
      const updatedExercises = [...customExercises, newExercise];

      if (typeof window !== 'undefined') {
        localStorage.setItem('customExercises', JSON.stringify(updatedExercises));
      }

      return newExercise;
    }
  },

  async updateExercise(exerciseId: string, updates: Partial<Exercise>): Promise<Exercise | null> {
    if (USE_API) {
      try {
        return apiCall<Exercise>(`/exercises/${exerciseId}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        });
      } catch (error) {
        console.error('Update exercise error:', error);
        return null;
      }
    } else {
      // Fallback to local data
      const customExercises = this.getCustomExercisesFromStorage();
      const exerciseIndex = customExercises.findIndex(e => e.id === exerciseId);

      if (exerciseIndex === -1) return null;

      customExercises[exerciseIndex] = { ...customExercises[exerciseIndex], ...updates };

      if (typeof window !== 'undefined') {
        localStorage.setItem('customExercises', JSON.stringify(customExercises));
      }

      return customExercises[exerciseIndex];
    }
  },

  async deleteExercise(exerciseId: string, userId: string): Promise<boolean> {
    if (USE_API) {
      try {
        await apiCall(`/exercises/${exerciseId}`, {
          method: 'DELETE',
        });
        return true;
      } catch (error) {
        console.error('Delete exercise error:', error);
        return false;
      }
    } else {
      // Fallback to local data
      const customExercises = this.getCustomExercisesFromStorage();
      const exercise = customExercises.find(e => e.id === exerciseId);

      if (!exercise || exercise.createdBy !== userId) {
        return false;
      }

      const updatedExercises = customExercises.filter(e => e.id !== exerciseId);

      if (typeof window !== 'undefined') {
        localStorage.setItem('customExercises', JSON.stringify(updatedExercises));
      }

      return true;
    }
  },

  async shareExercise(exerciseId: string, isShared: boolean): Promise<boolean> {
    // Share exercise by toggling isShared flag
    if (USE_API) {
      try {
        await this.updateExercise(exerciseId, { isShared });
        return true;
      } catch (error) {
        console.error('Share exercise error:', error);
        return false;
      }
    } else {
      // Fallback to local data
      const customExercises = this.getCustomExercisesFromStorage();
      const exerciseIndex = customExercises.findIndex(e => e.id === exerciseId);

      if (exerciseIndex === -1) return false;

      customExercises[exerciseIndex] = {
        ...customExercises[exerciseIndex],
        isShared
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('customExercises', JSON.stringify(customExercises));
      }

      return true;
    }
  },

  getCustomExercisesFromStorage(): Exercise[] {
    if (typeof window === 'undefined') return [];
    const exercisesStr = localStorage.getItem('customExercises');
    return exercisesStr ? JSON.parse(exercisesStr) : [];
  },

  // Rutinas
  async getRoutines(userId: string): Promise<Routine[]> {
    if (USE_API) {
      try {
        return apiCall<Routine[]>(`/routines/user/${userId}`);
      } catch (error) {
        console.error('Get routines error:', error);
        return [];
      }
    } else {
      // Fallback to local data
      const userRoutines = routines.filter(r => r.userId === userId);
      const customRoutines = this.getCustomRoutinesFromStorage().filter(r => r.userId === userId);
      const allRoutines = [...userRoutines, ...customRoutines];

      if (typeof window !== 'undefined') {
        const completedRoutines = this.getCompletedRoutines();
        return allRoutines.map(routine => ({
          ...routine,
          completed: completedRoutines[routine.id]?.completed || false,
          lastCompletedDate: completedRoutines[routine.id]?.lastCompletedDate
        }));
      }

      return allRoutines;
    }
  },

  async getRoutineById(routineId: string): Promise<Routine | undefined> {
    if (USE_API) {
      try {
        return apiCall<Routine>(`/routines/${routineId}`);
      } catch (error) {
        console.error('Get routine error:', error);
        return undefined;
      }
    } else {
      // Fallback to local data
      const customRoutines = this.getCustomRoutinesFromStorage();
      let routine = routines.find(r => r.id === routineId) || customRoutines.find(r => r.id === routineId);

      if (routine && typeof window !== 'undefined') {
        const completedRoutines = this.getCompletedRoutines();
        const completedExercises = this.getCompletedExercisesFromStorage();

        const exercisesWithCompletion = routine.exercises.map(ex => {
          const completionKey = `${routineId}-${ex.exerciseId}`;
          const completionData = completedExercises[completionKey];
          return {
            ...ex,
            completed: completionData?.completed || false,
            completedDate: completionData?.completedDate
          };
        });

        return {
          ...routine,
          exercises: exercisesWithCompletion,
          completed: completedRoutines[routine.id]?.completed || false,
          lastCompletedDate: completedRoutines[routine.id]?.lastCompletedDate
        };
      }

      return routine;
    }
  },

  async markExerciseAsCompleted(routineId: string, exerciseId: string, userId: string): Promise<void> {
    // TODO: Reemplazar con POST /api/routines/${routineId}/exercises/${exerciseId}/complete
    if (typeof window === 'undefined') return;

    const completedExercises = this.getCompletedExercisesFromStorage();
    const key = `${routineId}-${exerciseId}`;

    completedExercises[key] = {
      completed: true,
      completedDate: new Date().toISOString(),
      userId
    };

    localStorage.setItem('completedExercises', JSON.stringify(completedExercises));
  },

  async unmarkExerciseAsCompleted(routineId: string, exerciseId: string): Promise<void> {
    // TODO: Reemplazar con DELETE /api/routines/${routineId}/exercises/${exerciseId}/complete
    if (typeof window === 'undefined') return;

    const completedExercises = this.getCompletedExercisesFromStorage();
    const key = `${routineId}-${exerciseId}`;

    delete completedExercises[key];

    localStorage.setItem('completedExercises', JSON.stringify(completedExercises));
  },

  getCompletedExercisesFromStorage(): Record<string, { completed: boolean; completedDate?: string; userId: string }> {
    if (typeof window === 'undefined') return {};
    const completedStr = localStorage.getItem('completedExercises');
    return completedStr ? JSON.parse(completedStr) : {};
  },

  async markRoutineAsCompleted(routineId: string, userId: string): Promise<void> {
    // TODO: Reemplazar con POST /api/routines/${routineId}/complete
    if (typeof window === 'undefined') return;

    const completedRoutines = this.getCompletedRoutines();
    completedRoutines[routineId] = {
      completed: true,
      lastCompletedDate: new Date().toISOString(),
      userId
    };

    localStorage.setItem('completedRoutines', JSON.stringify(completedRoutines));
  },

  async unmarkRoutineAsCompleted(routineId: string): Promise<void> {
    // TODO: Reemplazar con DELETE /api/routines/${routineId}/complete
    if (typeof window === 'undefined') return;

    const completedRoutines = this.getCompletedRoutines();
    delete completedRoutines[routineId];

    localStorage.setItem('completedRoutines', JSON.stringify(completedRoutines));
  },

  getCompletedRoutines(): Record<string, { completed: boolean; lastCompletedDate?: string; userId: string }> {
    if (typeof window === 'undefined') return {};
    const completedStr = localStorage.getItem('completedRoutines');
    return completedStr ? JSON.parse(completedStr) : {};
  },

  async createRoutine(routine: Omit<Routine, 'id' | 'createdAt'>): Promise<Routine> {
    if (USE_API) {
      try {
        return apiCall<Routine>('/routines/', {
          method: 'POST',
          body: JSON.stringify(routine),
        });
      } catch (error) {
        console.error('Create routine error:', error);
        throw error;
      }
    } else {
      // Fallback to local data
      const newRoutine: Routine = {
        id: `custom-routine-${Date.now()}-${Math.random()}`,
        createdAt: new Date().toISOString(),
        isCustom: true,
        ...routine
      };

      const customRoutines = this.getCustomRoutinesFromStorage();
      const updatedRoutines = [...customRoutines, newRoutine];

      if (typeof window !== 'undefined') {
        localStorage.setItem('customRoutines', JSON.stringify(updatedRoutines));
      }

      return newRoutine;
    }
  },

  async deleteRoutine(routineId: string, userId: string): Promise<boolean> {
    if (USE_API) {
      try {
        await apiCall(`/routines/${routineId}`, {
          method: 'DELETE',
        });
        return true;
      } catch (error) {
        console.error('Delete routine error:', error);
        return false;
      }
    } else {
      // Fallback to local data
      const customRoutines = this.getCustomRoutinesFromStorage();
      const routine = customRoutines.find(r => r.id === routineId);

      if (!routine || routine.userId !== userId || !routine.isCustom) {
        return false;
      }

      const updatedRoutines = customRoutines.filter(r => r.id !== routineId);

      if (typeof window !== 'undefined') {
        localStorage.setItem('customRoutines', JSON.stringify(updatedRoutines));
      }

      return true;
    }
  },

  getCustomRoutinesFromStorage(): Routine[] {
    if (typeof window === 'undefined') return [];
    const routinesStr = localStorage.getItem('customRoutines');
    return routinesStr ? JSON.parse(routinesStr) : [];
  },

  async removeExerciseFromRoutine(routineId: string, exerciseId: string, userId: string): Promise<boolean> {
    // TODO: Reemplazar con DELETE /api/routines/${routineId}/exercises/${exerciseId}
    const customRoutines = this.getCustomRoutinesFromStorage();
    const routineIndex = customRoutines.findIndex(r => r.id === routineId);

    if (routineIndex === -1) return false;

    const routine = customRoutines[routineIndex];
    if (routine.userId !== userId) return false;

    customRoutines[routineIndex].exercises = routine.exercises.filter(e => e.exerciseId !== exerciseId);

    if (typeof window !== 'undefined') {
      localStorage.setItem('customRoutines', JSON.stringify(customRoutines));
    }

    return true;
  },

  // Progreso
  async saveProgress(progress: Omit<Progress, 'id'>): Promise<Progress> {
    if (USE_API) {
      try {
        return apiCall<Progress>('/progress/', {
          method: 'POST',
          body: JSON.stringify(progress),
        });
      } catch (error) {
        console.error('Save progress error:', error);
        throw error;
      }
    } else {
      // Fallback to local data
      const newProgress: Progress = {
        id: `progress-${Date.now()}-${Math.random()}`,
        ...progress
      };

      const existingProgress = this.getProgressFromStorage();
      const updatedProgress = [...existingProgress, newProgress];

      if (typeof window !== 'undefined') {
        localStorage.setItem('progress', JSON.stringify(updatedProgress));
      }

      return newProgress;
    }
  },

  async getProgress(userId: string, exerciseId?: string): Promise<Progress[]> {
    if (USE_API) {
      try {
        if (exerciseId) {
          return apiCall<Progress[]>(`/progress/exercise/${exerciseId}`);
        }
        return apiCall<Progress[]>(`/progress/user/${userId}`);
      } catch (error) {
        console.error('Get progress error:', error);
        return [];
      }
    } else {
      // Fallback to local data
      const allProgress = this.getProgressFromStorage();

      return allProgress.filter(p => {
        if (p.userId !== userId) return false;
        if (exerciseId && p.exerciseId !== exerciseId) return false;
        return true;
      });
    }
  },

  async getProgressByDate(userId: string, date: string): Promise<Progress[]> {
    if (USE_API) {
      try {
        const allProgress = await apiCall<Progress[]>(`/progress/user/${userId}`);
        return allProgress.filter(p => p.date === date);
      } catch (error) {
        console.error('Get progress by date error:', error);
        return [];
      }
    } else {
      // Fallback to local data
      const allProgress = this.getProgressFromStorage();
      return allProgress.filter(p => p.userId === userId && p.date === date);
    }
  },

  getProgressFromStorage(): Progress[] {
    if (typeof window === 'undefined') return [];
    const progressStr = localStorage.getItem('progress');
    return progressStr ? JSON.parse(progressStr) : [];
  },

  // Sesiones de entrenamiento
  async createWorkoutSession(session: Omit<WorkoutSession, 'id'>): Promise<WorkoutSession> {
    if (USE_API) {
      try {
        return apiCall<WorkoutSession>('/workout-sessions/', {
          method: 'POST',
          body: JSON.stringify(session),
        });
      } catch (error) {
        console.error('Create workout session error:', error);
        throw error;
      }
    } else {
      // Fallback to local data
      const newSession: WorkoutSession = {
        id: `session-${Date.now()}`,
        ...session
      };

      const existingSessions = this.getWorkoutSessionsFromStorage();
      const updatedSessions = [...existingSessions, newSession];

      if (typeof window !== 'undefined') {
        localStorage.setItem('workoutSessions', JSON.stringify(updatedSessions));
      }

      return newSession;
    }
  },

  async getWorkoutSessions(userId: string): Promise<WorkoutSession[]> {
    if (USE_API) {
      try {
        return apiCall<WorkoutSession[]>(`/workout-sessions/user/${userId}`);
      } catch (error) {
        console.error('Get workout sessions error:', error);
        return [];
      }
    } else {
      // Fallback to local data
      const allSessions = this.getWorkoutSessionsFromStorage();
      return allSessions.filter(s => s.userId === userId);
    }
  },

  async updateWorkoutSession(sessionId: string, updates: Partial<WorkoutSession>): Promise<WorkoutSession | null> {
    if (USE_API) {
      try {
        return apiCall<WorkoutSession>(`/workout-sessions/${sessionId}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        });
      } catch (error) {
        console.error('Update workout session error:', error);
        return null;
      }
    } else {
      // Fallback to local data
      const allSessions = this.getWorkoutSessionsFromStorage();
      const sessionIndex = allSessions.findIndex(s => s.id === sessionId);

      if (sessionIndex === -1) return null;

      allSessions[sessionIndex] = { ...allSessions[sessionIndex], ...updates };

      if (typeof window !== 'undefined') {
        localStorage.setItem('workoutSessions', JSON.stringify(allSessions));
      }

      return allSessions[sessionIndex];
    }
  },

  getWorkoutSessionsFromStorage(): WorkoutSession[] {
    if (typeof window === 'undefined') return [];
    const sessionsStr = localStorage.getItem('workoutSessions');
    return sessionsStr ? JSON.parse(sessionsStr) : [];
  },

  // Muscle Groups
  async getMuscleGroups(): Promise<import('@/types').MuscleGroup[]> {
    if (USE_API) {
      try {
        return apiCall<import('@/types').MuscleGroup[]>('/muscle-groups/');
      } catch (error) {
        console.error('Get muscle groups error:', error);
        // Return default muscle groups on error
        return this.getDefaultMuscleGroups();
      }
    } else {
      return this.getDefaultMuscleGroups();
    }
  },

  getDefaultMuscleGroups(): import('@/types').MuscleGroup[] {
    return [
      { id: 'pecho', name: 'Pecho' },
      { id: 'espalda', name: 'Espalda' },
      { id: 'hombros', name: 'Hombros' },
      { id: 'biceps', name: 'Bíceps' },
      { id: 'triceps', name: 'Tríceps' },
      { id: 'piernas', name: 'Piernas' },
      { id: 'gluteos', name: 'Glúteos' },
      { id: 'core', name: 'Core' },
      { id: 'abdomen', name: 'Abdomen' },
      { id: 'cardio', name: 'Cardio' },
    ];
  },

  // Usuarios
  async getUserById(userId: string): Promise<User | null> {
    if (USE_API) {
      try {
        return apiCall<User>(`/users/${userId}`);
      } catch (error) {
        console.error('Get user error:', error);
        return null;
      }
    } else {
      // Fallback to local data
      const user = users.find(u => u.id === userId);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
      }
      return null;
    }
  },

  async getUserNameById(userId: string): Promise<string> {
    // Intentar obtener del API primero
    if (USE_API) {
      try {
        const user = await this.getUserById(userId);
        if (user) {
          return user.name || user.username;
        }
      } catch (error) {
        console.error('Error getting user name:', error);
      }
    }

    // Fallback local para obtener nombre de usuario
    const user = users.find(u => u.id === userId);
    return user?.name || user?.username || 'Usuario desconocido';
  }
};

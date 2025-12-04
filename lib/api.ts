import { User, Routine, Progress, WorkoutSession } from '@/types';
import { users } from '@/data/users';
import { routines } from '@/data/routines';

// Esta es la capa de servicios que puede ser fácilmente reemplazada por llamadas API reales
// TODO: Reemplazar con llamadas fetch/axios al backend en el futuro

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Simulación de almacenamiento local (en producción será el backend)
let progressData: Progress[] = [];
let workoutSessions: WorkoutSession[] = [];

export const api = {
  // Autenticación
  async login(username: string, password: string): Promise<User | null> {
    // TODO: Reemplazar con POST /api/auth/login
    const user = users.find(
      u => u.username === username && u.password === password
    );
    if (user) {
      const { password, ...userWithoutPassword } = user;
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      return userWithoutPassword as User;
    }
    return null;
  },

  async logout(): Promise<void> {
    // TODO: Reemplazar con POST /api/auth/logout
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    // TODO: Reemplazar con GET /api/auth/me
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Rutinas
  async getRoutines(userId: string): Promise<Routine[]> {
    // TODO: Reemplazar con GET /api/routines?userId=${userId}
    return routines;
  },

  async getRoutineById(routineId: string): Promise<Routine | undefined> {
    // TODO: Reemplazar con GET /api/routines/${routineId}
    return routines.find(r => r.id === routineId);
  },

  // Progreso
  async saveProgress(progress: Omit<Progress, 'id'>): Promise<Progress> {
    // TODO: Reemplazar con POST /api/progress
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
  },

  async getProgress(userId: string, exerciseId?: string): Promise<Progress[]> {
    // TODO: Reemplazar con GET /api/progress?userId=${userId}&exerciseId=${exerciseId}
    const allProgress = this.getProgressFromStorage();

    return allProgress.filter(p => {
      if (p.userId !== userId) return false;
      if (exerciseId && p.exerciseId !== exerciseId) return false;
      return true;
    });
  },

  async getProgressByDate(userId: string, date: string): Promise<Progress[]> {
    // TODO: Reemplazar con GET /api/progress?userId=${userId}&date=${date}
    const allProgress = this.getProgressFromStorage();
    return allProgress.filter(p => p.userId === userId && p.date === date);
  },

  getProgressFromStorage(): Progress[] {
    if (typeof window === 'undefined') return [];
    const progressStr = localStorage.getItem('progress');
    return progressStr ? JSON.parse(progressStr) : [];
  },

  // Sesiones de entrenamiento
  async createWorkoutSession(session: Omit<WorkoutSession, 'id'>): Promise<WorkoutSession> {
    // TODO: Reemplazar con POST /api/workout-sessions
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
  },

  async getWorkoutSessions(userId: string): Promise<WorkoutSession[]> {
    // TODO: Reemplazar con GET /api/workout-sessions?userId=${userId}
    const allSessions = this.getWorkoutSessionsFromStorage();
    return allSessions.filter(s => s.userId === userId);
  },

  async updateWorkoutSession(sessionId: string, updates: Partial<WorkoutSession>): Promise<WorkoutSession | null> {
    // TODO: Reemplazar con PATCH /api/workout-sessions/${sessionId}
    const allSessions = this.getWorkoutSessionsFromStorage();
    const sessionIndex = allSessions.findIndex(s => s.id === sessionId);

    if (sessionIndex === -1) return null;

    allSessions[sessionIndex] = { ...allSessions[sessionIndex], ...updates };

    if (typeof window !== 'undefined') {
      localStorage.setItem('workoutSessions', JSON.stringify(allSessions));
    }

    return allSessions[sessionIndex];
  },

  getWorkoutSessionsFromStorage(): WorkoutSession[] {
    if (typeof window === 'undefined') return [];
    const sessionsStr = localStorage.getItem('workoutSessions');
    return sessionsStr ? JSON.parse(sessionsStr) : [];
  }
};

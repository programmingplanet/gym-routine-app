export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  username: string;
}

export interface Exercise {
  id: string;
  name: string;
  imageUrl: string;
  muscleGroup: string;
  description?: string;
  createdBy?: string; // userId del creador (undefined = ejercicio global)
  isShared?: boolean; // Si está compartido con otros usuarios
  sharedWith?: string[]; // IDs de usuarios con los que se compartió
  equipment?: string[]; // Equipamiento necesario
  createdAt?: string;
}

export interface RoutineExercise {
  exerciseId: string;
  sets: number;
  reps: string;
  order: number;
  completed?: boolean; // Si el ejercicio individual fue completado
  completedDate?: string;
}

export interface Routine {
  id: string;
  userId: string;
  dayNumber: number;
  dayName: string;
  exercises: RoutineExercise[];
  completed?: boolean;
  lastCompletedDate?: string;
  isCustom?: boolean; // Si es una rutina personalizada creada por el usuario
  createdAt?: string;
}

export interface Progress {
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

export interface WorkoutSession {
  id: string;
  userId: string;
  routineId: string;
  date: string;
  completed: boolean;
  progress: Progress[];
}

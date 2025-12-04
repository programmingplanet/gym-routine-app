export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
}

export interface Exercise {
  id: string;
  name: string;
  imageUrl: string;
  sets: number;
  reps: string;
  muscleGroup: string;
}

export interface Routine {
  id: string;
  userId: string;
  dayNumber: number;
  dayName: string;
  exercises: Exercise[];
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

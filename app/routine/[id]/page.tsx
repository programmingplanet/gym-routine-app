'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Header } from '@/components/organisms/Header';
import { WorkoutTracker } from '@/components/organisms/WorkoutTracker';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Routine, Progress, Exercise } from '@/types';
import { api } from '@/lib/api';
import { ArrowLeft, History, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';

export default function RoutinePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const routineId = params.id as string;

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [progressHistory, setProgressHistory] = useState<Progress[]>([]);
  const [exercisesCatalog, setExercisesCatalog] = useState<Exercise[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const loadData = async () => {
      const [routineData, exercises] = await Promise.all([
        api.getRoutineById(routineId),
        api.getExercises()
      ]);

      if (routineData) {
        setRoutine(routineData);
      }
      setExercisesCatalog(exercises);
    };
    loadData();
  }, [routineId]);

  useEffect(() => {
    const loadProgress = async () => {
      if (user) {
        const progress = await api.getProgress(user.id);
        setProgressHistory(progress.filter(p => p.routineId === routineId));
      }
    };
    loadProgress();
  }, [user, routineId]);

  const handleSaveProgress = async (
    exerciseId: string,
    progressData: Omit<Progress, 'id' | 'userId' | 'exerciseId' | 'routineId' | 'date'>
  ) => {
    if (!user) return;

    await api.saveProgress({
      userId: user.id,
      exerciseId,
      routineId,
      date: new Date().toISOString(),
      ...progressData
    });

    const updatedProgress = await api.getProgress(user.id);
    setProgressHistory(updatedProgress.filter(p => p.routineId === routineId));
  };

  const handleMarkAsCompleted = async () => {
    if (!user || !routine) return;

    if (routine.completed) {
      await api.unmarkRoutineAsCompleted(routineId);
    } else {
      await api.markRoutineAsCompleted(routineId, user.id);
    }

    // Recargar rutina
    const updatedRoutine = await api.getRoutineById(routineId);
    if (updatedRoutine) {
      setRoutine(updatedRoutine);
    }
  };

  const handleMarkExerciseComplete = async (exerciseId: string, completed: boolean) => {
    if (!user) return;

    if (completed) {
      await api.markExerciseAsCompleted(routineId, exerciseId, user.id);
    } else {
      await api.unmarkExerciseAsCompleted(routineId, exerciseId);
    }

    // Recargar rutina
    const updatedRoutine = await api.getRoutineById(routineId);
    if (updatedRoutine) {
      setRoutine(updatedRoutine);
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!user || !routine) return;

    await api.removeExerciseFromRoutine(routineId, exerciseId, user.id);

    // Recargar rutina
    const updatedRoutine = await api.getRoutineById(routineId);
    if (updatedRoutine) {
      setRoutine(updatedRoutine);
    }
  };

  if (isLoading || !user || !routine) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Día {routine.dayNumber}
                </h1>
                <Badge variant="primary">{routine.exercises.length} ejercicios</Badge>
                {routine.completed && (
                  <Badge variant="success">
                    <CheckCircle className="w-4 h-4 mr-1 inline" />
                    Completada
                  </Badge>
                )}
              </div>
              <h2 className="text-xl text-gray-600 dark:text-gray-400">
                {routine.dayName}
              </h2>
            </div>

            <div className="flex gap-3">
              <Button
                variant={routine.completed ? 'secondary' : 'primary'}
                onClick={handleMarkAsCompleted}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {routine.completed ? 'Desmarcar' : 'Marcar como Completada'}
              </Button>

              <Button
                variant="secondary"
                onClick={() => setShowHistory(!showHistory)}
              >
                <History className="w-4 h-4 mr-2" />
                {showHistory ? 'Ocultar' : 'Historial'}
              </Button>
            </div>
          </div>

          {showHistory && progressHistory.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Historial de Progreso
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {progressHistory
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 20)
                  .map((progress) => {
                    const exercise = exercisesCatalog.find(e => e.id === progress.exerciseId);
                    return (
                      <div
                        key={progress.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {exercise?.name || 'Ejercicio desconocido'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {format(new Date(progress.date), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">
                            {progress.weight} kg × {progress.reps} reps
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {progress.sets} series
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        <WorkoutTracker
          routineExercises={routine.exercises}
          exercisesCatalog={exercisesCatalog}
          onSaveProgress={handleSaveProgress}
          onMarkExerciseComplete={handleMarkExerciseComplete}
          onDeleteExercise={handleDeleteExercise}
          routineId={routine.id}
          isCustomRoutine={routine.isCustom}
        />
      </main>
    </div>
  );
}

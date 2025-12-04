'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Header } from '@/components/organisms/Header';
import { WorkoutTracker } from '@/components/organisms/WorkoutTracker';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Routine, Progress } from '@/types';
import { api } from '@/lib/api';
import { ArrowLeft, History } from 'lucide-react';
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

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const loadRoutine = async () => {
      const data = await api.getRoutineById(routineId);
      if (data) {
        setRoutine(data);
      }
    };
    loadRoutine();
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
              </div>
              <h2 className="text-xl text-gray-600 dark:text-gray-400">
                {routine.dayName}
              </h2>
            </div>

            <Button
              variant="secondary"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="w-4 h-4 mr-2" />
              {showHistory ? 'Ocultar Historial' : 'Ver Historial'}
            </Button>
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
                    const exercise = routine.exercises.find(e => e.id === progress.exerciseId);
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
          exercises={routine.exercises}
          onSaveProgress={handleSaveProgress}
          routineId={routine.id}
        />
      </main>
    </div>
  );
}

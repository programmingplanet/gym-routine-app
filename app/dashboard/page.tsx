'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Header } from '@/components/organisms/Header';
import { RoutineCard } from '@/components/molecules/RoutineCard';
import { RoutineFormModal } from '@/components/organisms/RoutineFormModal';
import { Button } from '@/components/atoms/Button';
import { Loading } from '@/components/atoms/Loading';
import { ToastContainer } from '@/components/organisms/ToastContainer';
import { useToast } from '@/lib/useToast';
import { Routine, Exercise } from '@/types';
import { api } from '@/lib/api';
import { Calendar, TrendingUp, Plus, Trash2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showRoutineForm, setShowRoutineForm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState({
    totalRoutines: 0,
    completedRoutines: 0,
    totalExercises: 0,
    lastWorkoutDate: null as string | null
  });
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        const [routinesData, exercisesData] = await Promise.all([
          api.getRoutines(user.id),
          api.getExercises(user.id)
        ]);
        setRoutines(routinesData);
        setExercises(exercisesData);

        // Calculate stats
        const completedCount = routinesData.filter(r => r.completed).length;
        const totalExercisesCount = routinesData.reduce((acc, r) => acc + r.exercises.length, 0);

        // Find last completed routine date
        const completedRoutines = routinesData.filter(r => r.lastCompletedDate);
        const lastDate = completedRoutines.length > 0
          ? completedRoutines.reduce((latest, r) => {
              const routineDate = new Date(r.lastCompletedDate!);
              return routineDate > latest ? routineDate : latest;
            }, new Date(completedRoutines[0].lastCompletedDate!))
          : null;

        setStats({
          totalRoutines: routinesData.length,
          completedRoutines: completedCount,
          totalExercises: totalExercisesCount,
          lastWorkoutDate: lastDate ? lastDate.toISOString() : null
        });
      }
    };
    loadData();
  }, [user]);

  if (isLoading || !user) {
    return <Loading fullScreen message="Cargando dashboard..." />;
  }

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Bienvenido, {user.name}
          </h2>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Calendar className="w-5 h-5" />
            <p className="capitalize">{today}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 mb-1">Rutinas Totales</p>
                <h3 className="text-3xl font-bold">{stats.totalRoutines}</h3>
                <p className="text-blue-100 mt-1">
                  {stats.completedRoutines} completadas
                </p>
              </div>
              <Calendar className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 mb-1">Ejercicios Totales</p>
                <h3 className="text-3xl font-bold">{stats.totalExercises}</h3>
                <p className="text-green-100 mt-1">En todas las rutinas</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 mb-1">Último Entrenamiento</p>
                <h3 className="text-2xl font-bold">
                  {stats.lastWorkoutDate
                    ? new Date(stats.lastWorkoutDate).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short'
                      })
                    : 'N/A'}
                </h3>
                <p className="text-purple-100 mt-1">
                  {stats.lastWorkoutDate
                    ? `Hace ${Math.floor((Date.now() - new Date(stats.lastWorkoutDate).getTime()) / (1000 * 60 * 60 * 24))} días`
                    : 'Sin entrenamientos'}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Tus Rutinas de Entrenamiento
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Selecciona una rutina para comenzar tu entrenamiento
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowRoutineForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nueva Rutina
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {routines.map((routine) => (
            <div key={routine.id} className="relative group">
              {routine.isCustom && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (window.confirm('¿Estás seguro de eliminar esta rutina?')) {
                      try {
                        setDeleting(true);
                        await api.deleteRoutine(routine.id, user.id);
                        const updated = await api.getRoutines(user.id);
                        setRoutines(updated);

                        // Update stats
                        const completedCount = updated.filter(r => r.completed).length;
                        const totalExercisesCount = updated.reduce((acc, r) => acc + r.exercises.length, 0);
                        setStats(prev => ({
                          ...prev,
                          totalRoutines: updated.length,
                          completedRoutines: completedCount,
                          totalExercises: totalExercisesCount
                        }));

                        success('Rutina eliminada exitosamente');
                      } catch (err) {
                        error('Error al eliminar la rutina');
                      } finally {
                        setDeleting(false);
                      }
                    }
                  }}
                  className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={deleting}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <RoutineCard
                routine={routine}
                onClick={() => router.push(`/routine/${routine.id}`)}
              />
            </div>
          ))}
        </div>

        {showRoutineForm && (
          <RoutineFormModal
            exercises={exercises}
            onSave={async (routineData) => {
              try {
                await api.createRoutine(routineData);
                const updated = await api.getRoutines(user.id);
                setRoutines(updated);

                // Update stats
                const completedCount = updated.filter(r => r.completed).length;
                const totalExercisesCount = updated.reduce((acc, r) => acc + r.exercises.length, 0);
                setStats(prev => ({
                  ...prev,
                  totalRoutines: updated.length,
                  completedRoutines: completedCount,
                  totalExercises: totalExercisesCount
                }));

                setShowRoutineForm(false);
                success('Rutina creada exitosamente');
              } catch (err) {
                error('Error al crear la rutina');
              }
            }}
            onClose={() => setShowRoutineForm(false)}
            userId={user.id}
            currentUserName={user.name}
            onError={(msg) => error(msg)}
          />
        )}
      </main>

      <ToastContainer toasts={toasts} onClose={removeToast} />
      {deleting && <Loading fullScreen message="Eliminando rutina..." />}
    </div>
  );
}

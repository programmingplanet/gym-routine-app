'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Header } from '@/components/organisms/Header';
import { RoutineCard } from '@/components/molecules/RoutineCard';
import { Routine } from '@/types';
import { api } from '@/lib/api';
import { Calendar, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [routines, setRoutines] = useState<Routine[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const loadRoutines = async () => {
      if (user) {
        const data = await api.getRoutines(user.id);
        setRoutines(data);
      }
    };
    loadRoutines();
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 mb-1">Rutina Actual</p>
                <h3 className="text-2xl font-bold">4 Días</h3>
                <p className="text-blue-100 mt-1">Musculación completa</p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 mb-1">Ejercicios Totales</p>
                <h3 className="text-2xl font-bold">{routines.reduce((acc, r) => acc + r.exercises.length, 0)}</h3>
                <p className="text-green-100 mt-1">En toda la rutina</p>
              </div>
              <Calendar className="w-12 h-12 text-green-200" />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Tus Rutinas de Entrenamiento
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Selecciona una rutina para comenzar tu entrenamiento
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {routines.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              onClick={() => router.push(`/routine/${routine.id}`)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

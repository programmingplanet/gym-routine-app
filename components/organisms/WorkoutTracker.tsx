'use client';

import React, { useState, useEffect } from 'react';
import { Exercise, RoutineExercise, Progress } from '@/types';
import { ExerciseCard } from '../molecules/ExerciseCard';
import { ProgressForm } from '../molecules/ProgressForm';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { X, CheckCircle, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { api } from '@/lib/api';

interface WorkoutTrackerProps {
  routineExercises: RoutineExercise[];
  exercisesCatalog: Exercise[];
  onSaveProgress: (exerciseId: string, progress: Omit<Progress, 'id' | 'userId' | 'exerciseId' | 'routineId' | 'date'>) => void;
  onMarkExerciseComplete?: (exerciseId: string, completed: boolean) => Promise<void>;
  onDeleteExercise?: (exerciseId: string) => Promise<void>;
  routineId: string;
  isCustomRoutine?: boolean;
}

export const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({
  routineExercises,
  exercisesCatalog,
  onSaveProgress,
  onMarkExerciseComplete,
  onDeleteExercise,
  isCustomRoutine
}) => {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);

  // Ordenar ejercicios por el campo order
  const sortedExercises = [...routineExercises].sort((a, b) => a.order - b.order);

  // Cargar ejercicios completados desde routineExercises
  useEffect(() => {
    const completed = new Set(
      routineExercises
        .filter(ex => ex.completed)
        .map(ex => ex.exerciseId)
    );
    setCompletedExercises(completed);
  }, [routineExercises]);

  const handleExerciseClick = (exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    setShowForm(true);
  };

  const handleSave = (data: Omit<Progress, 'id' | 'userId' | 'exerciseId' | 'routineId' | 'date'>) => {
    if (selectedExerciseId) {
      onSaveProgress(selectedExerciseId, data);
      setCompletedExercises(prev => new Set(prev).add(selectedExerciseId));

      // También marcar como completado
      if (onMarkExerciseComplete) {
        onMarkExerciseComplete(selectedExerciseId, true);
      }

      setShowForm(false);
      setSelectedExerciseId(null);
    }
  };

  const handleToggleComplete = async (exerciseId: string) => {
    const isCompleted = completedExercises.has(exerciseId);

    if (onMarkExerciseComplete) {
      await onMarkExerciseComplete(exerciseId, !isCompleted);
    }

    setCompletedExercises(prev => {
      const newSet = new Set(prev);
      if (isCompleted) {
        newSet.delete(exerciseId);
      } else {
        newSet.add(exerciseId);
      }
      return newSet;
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedExerciseId(null);
  };

  const selectedExercise = selectedExerciseId ? exercisesCatalog.find(e => e.id === selectedExerciseId) : null;
  const selectedRoutineEx = selectedExerciseId ? routineExercises.find(re => re.exerciseId === selectedExerciseId) : null;

  return (
    <div>
      {showForm && selectedExercise && selectedRoutineEx ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedExercise.name}
                </h2>
                <Button variant="ghost" size="sm" onClick={handleCancel} className="p-1">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Exercise Image */}
              <div className="relative h-64 w-full rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 mb-6">
                <Image
                  src={selectedExercise.imageUrl}
                  alt={selectedExercise.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>

              {/* Exercise Info */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  {selectedExercise.muscleGroups && selectedExercise.muscleGroups.map((muscleGroup) => (
                    <Badge key={muscleGroup} variant="info">{api.getMuscleGroupName(muscleGroup)}</Badge>
                  ))}
                  <Badge variant="primary">{selectedRoutineEx.sets} series</Badge>
                  <Badge variant="success">{selectedRoutineEx.reps} reps</Badge>
                </div>

                {selectedExercise.description && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Descripción
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {selectedExercise.description}
                    </p>
                  </div>
                )}

                {selectedExercise.equipment && selectedExercise.equipment.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                      Equipamiento necesario:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedExercise.equipment.map((item) => (
                        <span
                          key={item}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Form */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Registrar Progreso
                </h3>
                <ProgressForm
                  exercise={selectedExercise}
                  routineExercise={selectedRoutineEx}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedExercises.map((routineEx) => {
          const exercise = exercisesCatalog.find(e => e.id === routineEx.exerciseId);
          if (!exercise) return null;

          return (
            <div key={exercise.id} className="relative group">
              {completedExercises.has(exercise.id) && (
                <div className="absolute top-2 right-2 z-10 bg-green-500 rounded-full p-1">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              )}
              {isCustomRoutine && onDeleteExercise && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (confirm(`¿Eliminar ${exercise.name} de esta rutina?`)) {
                      await onDeleteExercise(exercise.id);
                    }
                  }}
                  className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <ExerciseCard
                exercise={exercise}
                routineExercise={routineEx}
                onClick={() => handleExerciseClick(exercise.id)}
              />
            </div>
          );
        })}
      </div>

      {completedExercises.size > 0 && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-800 dark:text-green-200 text-center font-medium">
            {completedExercises.size} de {sortedExercises.length} ejercicios completados
          </p>
        </div>
      )}
    </div>
  );
};

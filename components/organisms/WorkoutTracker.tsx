'use client';

import React, { useState } from 'react';
import { Exercise, Progress } from '@/types';
import { ExerciseCard } from '../molecules/ExerciseCard';
import { ProgressForm } from '../molecules/ProgressForm';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { X, CheckCircle } from 'lucide-react';

interface WorkoutTrackerProps {
  exercises: Exercise[];
  onSaveProgress: (exerciseId: string, progress: Omit<Progress, 'id' | 'userId' | 'exerciseId' | 'routineId' | 'date'>) => void;
  routineId: string;
}

export const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({
  exercises,
  onSaveProgress,
  routineId
}) => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowForm(true);
  };

  const handleSave = (data: Omit<Progress, 'id' | 'userId' | 'exerciseId' | 'routineId' | 'date'>) => {
    if (selectedExercise) {
      onSaveProgress(selectedExercise.id, data);
      setCompletedExercises(prev => new Set(prev).add(selectedExercise.id));
      setShowForm(false);
      setSelectedExercise(null);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedExercise(null);
  };

  return (
    <div>
      {showForm && selectedExercise ? (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {selectedExercise.name}
            </h3>
            <Button variant="ghost" size="sm" onClick={handleCancel} className="p-1">
              <X className="w-5 h-5" />
            </Button>
          </div>
          <ProgressForm
            exercise={selectedExercise}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </Card>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="relative">
            {completedExercises.has(exercise.id) && (
              <div className="absolute top-2 right-2 z-10 bg-green-500 rounded-full p-1">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            )}
            <ExerciseCard
              exercise={exercise}
              onClick={() => handleExerciseClick(exercise)}
            />
          </div>
        ))}
      </div>

      {completedExercises.size > 0 && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-800 dark:text-green-200 text-center font-medium">
            {completedExercises.size} de {exercises.length} ejercicios completados
          </p>
        </div>
      )}
    </div>
  );
};

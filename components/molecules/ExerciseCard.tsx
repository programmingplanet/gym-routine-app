import React from 'react';
import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { Exercise, RoutineExercise } from '@/types';
import Image from 'next/image';
import { api } from '@/lib/api';

interface ExerciseCardProps {
  exercise: Exercise;
  routineExercise?: RoutineExercise;
  onClick?: () => void;
  showSharedBy?: boolean; // Mostrar quién compartió el ejercicio
  sharedByName?: string; // Nombre del usuario que compartió
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, routineExercise, onClick, showSharedBy, sharedByName }) => {
  return (
    <Card hover={!!onClick} onClick={onClick} className="overflow-hidden">
      <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-700">
        <Image
          src={exercise.imageUrl}
          alt={exercise.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {showSharedBy && sharedByName && (
          <div className="absolute top-2 left-2 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Compartido por {sharedByName}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
          {exercise.name}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          {exercise.muscleGroups?.map((mg) => (
            <Badge key={mg} variant="info">{api.getMuscleGroupName(mg)}</Badge>
          ))}
          {routineExercise && (
            <>
              <Badge variant="primary">{routineExercise.sets} series</Badge>
              <Badge variant="success">{routineExercise.reps} reps</Badge>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

import React from 'react';
import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { Exercise } from '@/types';
import Image from 'next/image';

interface ExerciseCardProps {
  exercise: Exercise;
  onClick?: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onClick }) => {
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
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
          {exercise.name}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="info">{exercise.muscleGroup}</Badge>
          <Badge variant="primary">{exercise.sets} series</Badge>
          <Badge variant="success">{exercise.reps} reps</Badge>
        </div>
      </div>
    </Card>
  );
};

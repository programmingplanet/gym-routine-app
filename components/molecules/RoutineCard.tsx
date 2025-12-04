import React from 'react';
import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { Routine } from '@/types';

interface RoutineCardProps {
  routine: Routine;
  onClick: () => void;
}

export const RoutineCard: React.FC<RoutineCardProps> = ({ routine, onClick }) => {
  return (
    <Card hover onClick={onClick} className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Día {routine.dayNumber}
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {routine.dayName}
          </p>
        </div>
        <Badge variant="primary">{routine.exercises.length} ejercicios</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from(new Set(routine.exercises.map(e => e.muscleGroup))).map(group => (
          <Badge key={group} variant="info">
            {group}
          </Badge>
        ))}
      </div>
    </Card>
  );
};

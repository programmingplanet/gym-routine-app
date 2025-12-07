import React from 'react';
import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { Routine } from '@/types';
import { CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';

interface RoutineCardProps {
  routine: Routine;
  onClick: () => void;
}

export const RoutineCard: React.FC<RoutineCardProps> = ({ routine, onClick }) => {
  return (
    <Card hover onClick={onClick} className="p-6 relative">
      {routine.completed && (
        <div className="absolute top-3 right-3 bg-green-500 rounded-full p-1.5">
          <CheckCircle className="w-5 h-5 text-white" />
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="pr-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Día {routine.dayNumber}
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {routine.dayName}
          </p>
          {routine.completed && routine.lastCompletedDate && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Completado: {format(new Date(routine.lastCompletedDate), 'd MMM', { locale: es })}
            </p>
          )}
        </div>
        <Badge variant="primary">{routine.exercises.length} ejercicios</Badge>
      </div>
    </Card>
  );
};

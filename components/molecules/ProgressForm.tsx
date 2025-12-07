'use client';

import React, { useState } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { Exercise, RoutineExercise, Progress } from '@/types';

interface ProgressFormProps {
  exercise: Exercise;
  routineExercise: RoutineExercise;
  onSave: (data: Omit<Progress, 'id' | 'userId' | 'exerciseId' | 'routineId' | 'date'>) => void;
  onCancel: () => void;
  initialData?: {
    weight: number;
    reps: number;
    sets: number;
    notes?: string;
  };
}

export const ProgressForm: React.FC<ProgressFormProps> = ({
  exercise,
  routineExercise,
  onSave,
  onCancel,
  initialData
}) => {
  const [weight, setWeight] = useState(initialData?.weight?.toString() || '');
  const [reps, setReps] = useState(initialData?.reps?.toString() || '');
  const [sets, setSets] = useState(initialData?.sets?.toString() || routineExercise.sets.toString());
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      weight: parseFloat(weight),
      reps: parseInt(reps),
      sets: parseInt(sets),
      notes
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          type="number"
          label="Peso (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="0"
          step="0.5"
          required
        />
        <Input
          type="number"
          label="Repeticiones"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          placeholder="0"
          required
        />
        <Input
          type="number"
          label="Series"
          value={sets}
          onChange={(e) => setSets(e.target.value)}
          placeholder="0"
          required
        />
      </div>
      <Input
        type="text"
        label="Notas (opcional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Ej: Sentí mucha tensión en el hombro derecho"
      />
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          Guardar Progreso
        </Button>
      </div>
    </form>
  );
};

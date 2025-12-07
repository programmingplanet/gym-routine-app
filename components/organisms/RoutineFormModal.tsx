'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../atoms/Card';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Exercise, Routine, RoutineExercise } from '@/types';
import { X, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { api } from '@/lib/api';

interface RoutineFormModalProps {
  exercises: Exercise[];
  onSave: (routine: Omit<Routine, 'id' | 'createdAt'>) => void;
  onClose: () => void;
  userId: string;
  currentUserName: string;
  onError?: (message: string) => void;
}

export const RoutineFormModal: React.FC<RoutineFormModalProps> = ({
  exercises,
  onSave,
  onClose,
  userId,
  currentUserName,
  onError
}) => {
  const [dayName, setDayName] = useState('');
  const [dayNumber, setDayNumber] = useState(1);
  const [selectedExercises, setSelectedExercises] = useState<RoutineExercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroupFilter, setSelectedMuscleGroupFilter] = useState<string>('');
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [muscleGroups, setMuscleGroups] = useState<import('@/types').MuscleGroup[]>([]);

  useEffect(() => {
    // Cargar grupos musculares
    const loadMuscleGroups = async () => {
      const groups = await api.getMuscleGroups();
      setMuscleGroups(groups);
    };

    loadMuscleGroups();
  }, []);

  useEffect(() => {
    // Precargar nombres de usuarios para ejercicios compartidos
    const loadUserNames = async () => {
      const uniqueCreators = [...new Set(
        exercises
          .filter(e => e.createdBy && e.createdBy !== userId)
          .map(e => e.createdBy!)
      )];

      const names: Record<string, string> = {};
      for (const creatorId of uniqueCreators) {
        names[creatorId] = await api.getUserNameById(creatorId);
      }
      setUserNames(names);
    };

    loadUserNames();
  }, [exercises, userId]);

  const filteredExercises = exercises.filter(ex => {
    // Filtrar por término de búsqueda
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.muscleGroups?.some(mg => api.getMuscleGroupName(mg).toLowerCase().includes(searchTerm.toLowerCase()));

    // Filtrar por grupo muscular seleccionado
    const matchesMuscleGroup = !selectedMuscleGroupFilter ||
      ex.muscleGroups?.includes(selectedMuscleGroupFilter);

    return matchesSearch && matchesMuscleGroup;
  });

  const handleAddExercise = (exercise: Exercise) => {
    const newRoutineExercise: RoutineExercise = {
      exerciseId: exercise.id,
      sets: 3,
      reps: '10-12',
      order: selectedExercises.length
    };
    setSelectedExercises([...selectedExercises, newRoutineExercise]);
  };

  const handleRemoveExercise = (index: number) => {
    const updated = selectedExercises.filter((_, i) => i !== index);
    // Reordenar
    const reordered = updated.map((ex, i) => ({ ...ex, order: i }));
    setSelectedExercises(reordered);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...selectedExercises];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    const reordered = updated.map((ex, i) => ({ ...ex, order: i }));
    setSelectedExercises(reordered);
  };

  const handleMoveDown = (index: number) => {
    if (index === selectedExercises.length - 1) return;
    const updated = [...selectedExercises];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    const reordered = updated.map((ex, i) => ({ ...ex, order: i }));
    setSelectedExercises(reordered);
  };

  const handleUpdateSets = (index: number, sets: number) => {
    const updated = [...selectedExercises];
    updated[index].sets = sets;
    setSelectedExercises(updated);
  };

  const handleUpdateReps = (index: number, reps: string) => {
    const updated = [...selectedExercises];
    updated[index].reps = reps;
    setSelectedExercises(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedExercises.length === 0) {
      if (onError) {
        onError('Debes agregar al menos un ejercicio a la rutina');
      }
      return;
    }
    onSave({
      userId,
      dayNumber,
      dayName,
      exercises: selectedExercises,
      isCustom: true
    });
    onClose();
  };

  const getExerciseById = (id: string) => exercises.find(e => e.id === id);
  const getUserName = (createdBy?: string) => {
    if (!createdBy) return null;
    if (createdBy === userId) return currentUserName;
    return userNames[createdBy] || 'Cargando...';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Crear Nueva Rutina
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre de la Rutina"
                value={dayName}
                onChange={(e) => setDayName(e.target.value)}
                placeholder="Ej: Pecho y Tríceps"
                required
              />
              <Input
                label="Día de la Semana"
                type="number"
                value={dayNumber.toString()}
                onChange={(e) => setDayNumber(parseInt(e.target.value))}
                min="1"
                max="7"
                required
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lista de ejercicios disponibles */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Ejercicios Disponibles
                </h3>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar ejercicios..."
                  className="mb-3"
                />

                {/* Filtro por grupo muscular */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Filtrar por Grupo Muscular
                  </label>
                  <select
                    value={selectedMuscleGroupFilter}
                    onChange={(e) => setSelectedMuscleGroupFilter(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todos los grupos musculares</option>
                    {muscleGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredExercises.map((exercise) => {
                    const isAdded = selectedExercises.some(ex => ex.exerciseId === exercise.id);
                    const sharedByName = getUserName(exercise.createdBy);
                    return (
                      <div
                        key={exercise.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="relative h-16 w-16 rounded overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                          <Image
                            src={exercise.imageUrl}
                            alt={exercise.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {exercise.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {exercise.muscleGroups?.map((mg) => (
                              <Badge key={mg} variant="info" className="text-xs">
                                {api.getMuscleGroupName(mg)}
                              </Badge>
                            ))}
                            {sharedByName && (
                              <Badge variant="info" className="text-xs">
                                Por {sharedByName}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleAddExercise(exercise)}
                          disabled={isAdded}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lista de ejercicios seleccionados */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Ejercicios en la Rutina ({selectedExercises.length})
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedExercises.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                      No has agregado ejercicios aún
                    </p>
                  ) : (
                    selectedExercises.map((routineEx, index) => {
                      const exercise = getExerciseById(routineEx.exerciseId);
                      if (!exercise) return null;
                      return (
                        <div
                          key={`${routineEx.exerciseId}-${index}`}
                          className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className="flex flex-col gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                                className="p-1"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMoveDown(index)}
                                disabled={index === selectedExercises.length - 1}
                                className="p-1"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white mb-2">
                                {index + 1}. {exercise.name}
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  label="Series"
                                  type="number"
                                  value={routineEx.sets.toString()}
                                  onChange={(e) => handleUpdateSets(index, parseInt(e.target.value))}
                                  min="1"
                                />
                                <Input
                                  label="Repeticiones"
                                  value={routineEx.reps}
                                  onChange={(e) => handleUpdateReps(index, e.target.value)}
                                  placeholder="10-12"
                                />
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="danger"
                              size="sm"
                              onClick={() => handleRemoveExercise(index)}
                              className="p-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                Crear Rutina
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../atoms/Card';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { Exercise, MuscleGroup } from '@/types';
import { X, Share2 } from 'lucide-react';
import { api } from '@/lib/api';

interface ExerciseFormModalProps {
  exercise?: Exercise;
  onSave: (exercise: Omit<Exercise, 'id' | 'createdAt'>) => void;
  onClose: () => void;
  userId: string;
}

export const ExerciseFormModal: React.FC<ExerciseFormModalProps> = ({
  exercise,
  onSave,
  onClose,
  userId
}) => {
  const [name, setName] = useState(exercise?.name || '');
  const [imageUrl, setImageUrl] = useState(exercise?.imageUrl || '');
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>(exercise?.muscleGroups || []);
  const [availableMuscleGroups, setAvailableMuscleGroups] = useState<MuscleGroup[]>([]);
  const [description, setDescription] = useState(exercise?.description || '');
  const [equipment, setEquipment] = useState<string[]>(exercise?.equipment || []);
  const [newEquipment, setNewEquipment] = useState('');
  const [isShared, setIsShared] = useState(exercise?.isShared || false);

  useEffect(() => {
    loadMuscleGroups();
  }, []);

  const loadMuscleGroups = async () => {
    try {
      const groups = await api.getMuscleGroups();
      setAvailableMuscleGroups(groups);
    } catch (error) {
      console.error('Error loading muscle groups:', error);
      // Fallback to default muscle groups
      setAvailableMuscleGroups([
        { id: 'pecho', name: 'Pecho' },
        { id: 'espalda', name: 'Espalda' },
        { id: 'hombros', name: 'Hombros' },
        { id: 'biceps', name: 'Bíceps' },
        { id: 'triceps', name: 'Tríceps' },
        { id: 'piernas', name: 'Piernas' },
        { id: 'gluteos', name: 'Glúteos' },
        { id: 'core', name: 'Core' },
        { id: 'abdomen', name: 'Abdomen' },
      ]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMuscleGroups.length === 0) {
      alert('Debes seleccionar al menos un grupo muscular');
      return;
    }
    onSave({
      name,
      imageUrl,
      muscleGroups: selectedMuscleGroups,
      description,
      equipment,
      createdBy: userId,
      isShared
    });
    onClose();
  };

  const handleAddEquipment = () => {
    if (newEquipment.trim() && !equipment.includes(newEquipment.trim())) {
      setEquipment([...equipment, newEquipment.trim()]);
      setNewEquipment('');
    }
  };

  const toggleMuscleGroup = (groupId: string) => {
    if (selectedMuscleGroups.includes(groupId)) {
      setSelectedMuscleGroups(selectedMuscleGroups.filter(g => g !== groupId));
    } else {
      setSelectedMuscleGroups([...selectedMuscleGroups, groupId]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {exercise ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre del Ejercicio"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Press de Pecho Inclinado"
              required
            />

            <Input
              label="URL de la Imagen"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              required
            />

            {imageUrl && (
              <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Error+al+cargar+imagen';
                  }}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Grupos Musculares
              </label>
              <div className="flex flex-wrap gap-2 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
                {availableMuscleGroups.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => toggleMuscleGroup(group.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedMuscleGroups.includes(group.id)
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {group.name}
                  </button>
                ))}
              </div>
              {selectedMuscleGroups.length === 0 && (
                <p className="text-sm text-red-500 mt-1">Selecciona al menos un grupo muscular</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción del ejercicio..."
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Equipamiento Necesario
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  placeholder="Ej: Mancuernas"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEquipment())}
                />
                <Button type="button" onClick={handleAddEquipment}>
                  Agregar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {equipment.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm flex items-center gap-2"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => setEquipment(equipment.filter(e => e !== item))}
                      className="hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <input
                type="checkbox"
                id="isShared"
                checked={isShared}
                onChange={(e) => setIsShared(e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isShared" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                <Share2 className="w-5 h-5 text-blue-500" />
                <div>
                  <div>Compartir ejercicio públicamente</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Los ejercicios compartidos estarán disponibles para todos los usuarios
                  </div>
                </div>
              </label>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                {exercise ? 'Actualizar' : 'Crear'} Ejercicio
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

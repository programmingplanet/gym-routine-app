'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../atoms/Card';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { Exercise } from '@/types';
import { X } from 'lucide-react';

interface ExerciseFormModalProps {
  exercise?: Exercise;
  onSave: (exercise: Omit<Exercise, 'id' | 'createdAt'>) => void;
  onClose: () => void;
  userId: string;
}

const muscleGroups = [
  'pecho', 'espalda', 'hombros', 'bíceps', 'tríceps',
  'piernas', 'glúteos', 'core', 'fullbody', 'abdomen'
];

export const ExerciseFormModal: React.FC<ExerciseFormModalProps> = ({
  exercise,
  onSave,
  onClose,
  userId
}) => {
  const [name, setName] = useState(exercise?.name || '');
  const [imageUrl, setImageUrl] = useState(exercise?.imageUrl || '');
  const [muscleGroup, setMuscleGroup] = useState(exercise?.muscleGroup || 'pecho');
  const [description, setDescription] = useState(exercise?.description || '');
  const [equipment, setEquipment] = useState<string[]>(exercise?.equipment || []);
  const [newEquipment, setNewEquipment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      imageUrl,
      muscleGroup,
      description,
      equipment,
      createdBy: userId
    });
    onClose();
  };

  const handleAddEquipment = () => {
    if (newEquipment.trim() && !equipment.includes(newEquipment.trim())) {
      setEquipment([...equipment, newEquipment.trim()]);
      setNewEquipment('');
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
                Grupo Muscular
              </label>
              <select
                value={muscleGroup}
                onChange={(e) => setMuscleGroup(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {muscleGroups.map((group) => (
                  <option key={group} value={group}>
                    {group.charAt(0).toUpperCase() + group.slice(1)}
                  </option>
                ))}
              </select>
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

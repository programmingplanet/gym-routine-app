'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Header } from '@/components/organisms/Header';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Card } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Loading } from '@/components/atoms/Loading';
import { ToastContainer } from '@/components/organisms/ToastContainer';
import { useToast } from '@/lib/useToast';
import { Exercise } from '@/types';
import { api } from '@/lib/api';
import { useWebLLM } from '@/lib/useWebLLM';
import { ExerciseFormModal } from '@/components/organisms/ExerciseFormModal';
import {
  Plus,
  Trash2,
  Share2,
  Bot,
  Send,
  Loader,
  Dumbbell,
  ArrowLeft,
  Edit
} from 'lucide-react';
import Image from 'next/image';

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toasts, removeToast, success, error: showError, warning } = useToast();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [newEquipment, setNewEquipment] = useState('');
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [userMessage, setUserMessage] = useState('');
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    initializeModel,
    askQuestion,
    askAboutExercises,
    isLoading: aiLoading,
    isModelLoaded,
    loadingProgress,
    error: aiError
  } = useWebLLM();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        const allExercises = await api.getExercises(user.id);
        // Filtrar solo ejercicios del usuario
        const userExercises = allExercises.filter(e => e.createdBy === user.id);
        setExercises(userExercises);

        // Cargar equipamiento
        const savedEquipment = localStorage.getItem(`equipment-${user.id}`);
        if (savedEquipment) {
          setEquipment(JSON.parse(savedEquipment));
        }
      }
    };
    loadData();
  }, [user]);

  const handleAddEquipment = () => {
    if (newEquipment.trim() && !equipment.includes(newEquipment.trim())) {
      const updated = [...equipment, newEquipment.trim()];
      setEquipment(updated);
      if (user) {
        localStorage.setItem(`equipment-${user.id}`, JSON.stringify(updated));
      }
      setNewEquipment('');
    }
  };

  const handleRemoveEquipment = (item: string) => {
    const updated = equipment.filter(e => e !== item);
    setEquipment(updated);
    if (user) {
      localStorage.setItem(`equipment-${user.id}`, JSON.stringify(updated));
    }
  };

  const handleAskAI = async () => {
    try {
      if (!isModelLoaded) {
        await initializeModel();
      }

      const response = await askAboutExercises(equipment);
      setChatMessages([
        ...chatMessages,
        { role: 'user', content: `¿Qué ejercicios puedo hacer con mi equipamiento?` },
        { role: 'assistant', content: response }
      ]);
      setShowAIChat(true);
    } catch (error) {
      showError('El asistente de IA requiere un navegador compatible con WebGPU. Por favor usa Chrome/Edge moderno o un dispositivo con GPU.');
    }
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim() || aiLoading) return;

    // Inicializar el modelo si no está cargado
    if (!isModelLoaded) {
      await initializeModel();
    }

    const newMessages = [
      ...chatMessages,
      { role: 'user', content: userMessage }
    ];
    setChatMessages(newMessages);
    setUserMessage('');

    try {
      const response = await askQuestion(userMessage, equipment);
      setChatMessages([...newMessages, { role: 'assistant', content: response }]);
    } catch (error) {
      setChatMessages([
        ...newMessages,
        { role: 'assistant', content: 'Lo siento, hubo un error. Por favor intenta de nuevo.' }
      ]);
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (user && window.confirm('¿Estás seguro de eliminar este ejercicio?')) {
      try {
        setIsDeleting(true);
        await api.deleteExercise(exerciseId, user.id);
        setExercises(exercises.filter(e => e.id !== exerciseId));
        success('Ejercicio eliminado exitosamente');
      } catch (err) {
        showError('Error al eliminar el ejercicio');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleShareExercise = async (exerciseId: string) => {
    if (user) {
      try {
        const exercise = exercises.find(e => e.id === exerciseId);
        if (!exercise) return;

        // Toggle isShared to make exercise public/private
        const updatedExercise = await api.updateExercise(exerciseId, {
          ...exercise,
          isShared: !exercise.isShared
        });

        if (updatedExercise) {
          setExercises(exercises.map(e => e.id === exerciseId ? updatedExercise : e));
          success(updatedExercise.isShared ? 'Ejercicio compartido públicamente' : 'Ejercicio ahora es privado');
        }
      } catch (err) {
        showError('Error al actualizar el ejercicio');
      }
    }
  };

  const handleSaveExercise = async (exerciseData: Omit<Exercise, 'id' | 'createdAt'>) => {
    if (editingExercise) {
      // Actualizar ejercicio existente
      await api.updateExercise(editingExercise.id, exerciseData);
      const updatedExercises = exercises.map(ex =>
        ex.id === editingExercise.id ? { ...ex, ...exerciseData } : ex
      );
      setExercises(updatedExercises);
    } else {
      // Crear nuevo ejercicio
      const newExercise = await api.createExercise(exerciseData);
      setExercises([...exercises, newExercise]);
    }
    setEditingExercise(null);
    setShowExerciseForm(false);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Configuración
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona tus ejercicios personalizados y equipamiento
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Equipamiento */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Dumbbell className="w-6 h-6" />
              Mi Equipamiento
            </h2>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  placeholder="Ej: Mancuernas, Barra olímpica..."
                  onKeyPress={(e) => e.key === 'Enter' && handleAddEquipment()}
                />
                <Button onClick={handleAddEquipment}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {equipment.map((item) => (
                  <Badge key={item} variant="info" className="flex items-center gap-2 pr-1">
                    {item}
                    <button
                      onClick={() => handleRemoveEquipment(item)}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                {equipment.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No has agregado equipamiento aún
                  </p>
                )}
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={handleAskAI}
                disabled={aiLoading || !!aiError}
              >
                {isModelLoaded ? (
                  <>
                    <Bot className="w-4 h-4 mr-2" />
                    Pregunta a la IA
                  </>
                ) : aiLoading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Cargando modelo... {loadingProgress}%
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4 mr-2" />
                    Iniciar Asistente IA
                  </>
                )}
              </Button>

              {aiError && (
                <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    ⚠️ Tu navegador o dispositivo no soporta WebGPU. El asistente de IA requiere Chrome/Edge moderno y una GPU.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Mis Ejercicios */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Mis Ejercicios Personalizados
              </h2>
              <Button size="sm" onClick={() => setShowExerciseForm(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Nuevo
              </Button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {exercises.map((exercise) => (
                <Card key={exercise.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                      <Image
                        src={exercise.imageUrl}
                        alt={exercise.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {exercise.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {exercise.muscleGroups?.join(', ')}
                      </p>
                      <div className="flex gap-2 mt-1">
                        {exercise.isShared && (
                          <Badge variant="success" className="text-xs">Compartido</Badge>
                        )}
                        {exercise.createdBy && exercise.createdBy !== user?.id && (
                          <Badge variant="info" className="text-xs">
                            Compartido por {api.getUserNameById(exercise.createdBy)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleShareExercise(exercise.id)}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteExercise(exercise.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {exercises.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  No tienes ejercicios personalizados aún.
                  Crea uno para comenzar.
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Chat con IA */}
        {showAIChat && (
          <Card className="p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Bot className="w-6 h-6" />
                Asistente de Ejercicios IA
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowAIChat(false)}>
                ×
              </Button>
            </div>

            <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg">
                    <Loader className="w-5 h-5 animate-spin text-gray-600 dark:text-gray-300" />
                  </div>
                </div>
              )}
            </div>

            {aiError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  ⚠️ {aiError}
                  <br />
                  <span className="text-xs">Nota: El asistente de IA requiere WebGPU. Verifica en <a href="https://webgpureport.org/" target="_blank" rel="noopener noreferrer" className="underline">webgpureport.org</a></span>
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Input
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Pregunta sobre ejercicios..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={aiLoading || !!aiError}
              />
              <Button onClick={handleSendMessage} disabled={aiLoading || !!aiError}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Modal de Formulario de Ejercicio */}
        {showExerciseForm && user && (
          <ExerciseFormModal
            exercise={editingExercise || undefined}
            onSave={handleSaveExercise}
            onClose={() => {
              setShowExerciseForm(false);
              setEditingExercise(null);
            }}
            userId={user.id}
          />
        )}
      </main>

      <ToastContainer toasts={toasts} onClose={removeToast} />
      {isDeleting && <Loading fullScreen message="Eliminando ejercicio..." />}
    </div>
  );
}

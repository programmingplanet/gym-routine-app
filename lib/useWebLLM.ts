'use client';

import { useState, useCallback, useRef } from 'react';
import * as webllm from '@mlc-ai/web-llm';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export function useWebLLM() {
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const engineRef = useRef<webllm.MLCEngine | null>(null);

  const initializeModel = useCallback(async () => {
    if (engineRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      const engine = await webllm.CreateMLCEngine('Llama-3-8B-Instruct-q4f32_1-MLC', {
        initProgressCallback: (progress) => {
          setLoadingProgress(Math.round(progress.progress * 100));
        }
      });

      engineRef.current = engine;
      setIsModelLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el modelo');
      console.error('Error inicializando WebLLM:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const chat = useCallback(async (messages: Message[]): Promise<string> => {
    if (!engineRef.current) {
      throw new Error('Modelo no inicializado. Llama a initializeModel primero.');
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await engineRef.current.chat.completions.create({
        messages: messages as any,
        temperature: 0.7,
        max_tokens: 500,
      });

      return response.choices[0]?.message?.content || '';
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error en el chat';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const askAboutExercises = useCallback(async (equipment: string[]): Promise<string> => {
    const systemPrompt = `Eres un experto entrenador personal. Tu trabajo es recomendar ejercicios específicos basados en el equipamiento disponible del usuario.

REGLAS IMPORTANTES:
1. SOLO responde preguntas sobre ejercicios y entrenamiento
2. Si te preguntan algo que NO sea sobre ejercicios, responde: "Solo puedo ayudarte con recomendaciones de ejercicios"
3. Sé específico y menciona: nombre del ejercicio, grupo muscular, series y repeticiones recomendadas
4. Mantén respuestas cortas y directas (máximo 400 palabras)
5. Si no tienen equipamiento, recomienda ejercicios con peso corporal

Equipamiento disponible del usuario: ${equipment.length > 0 ? equipment.join(', ') : 'Ninguno (solo peso corporal)'}`;

    const userMessage = equipment.length > 0
      ? `Tengo el siguiente equipamiento: ${equipment.join(', ')}. ¿Qué ejercicios me recomiendas para un entrenamiento completo?`
      : '¿Qué ejercicios puedo hacer sin equipamiento, solo con mi peso corporal?';

    return await chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ]);
  }, [chat]);

  const validateExerciseQuestion = useCallback((question: string): boolean => {
    const exerciseKeywords = [
      'ejercicio', 'entrenar', 'rutina', 'músculo', 'pecho', 'espalda',
      'piernas', 'hombros', 'bíceps', 'tríceps', 'abdomen', 'glúteos',
      'pesas', 'mancuernas', 'barra', 'máquina', 'cardio', 'fuerza',
      'series', 'repeticiones', 'descanso', 'calentamiento'
    ];

    const lowerQuestion = question.toLowerCase();
    return exerciseKeywords.some(keyword => lowerQuestion.includes(keyword));
  }, []);

  const askQuestion = useCallback(async (question: string, equipment: string[]): Promise<string> => {
    if (!validateExerciseQuestion(question)) {
      return 'Solo puedo ayudarte con preguntas sobre ejercicios, rutinas de entrenamiento y equipamiento. ¿Tienes alguna pregunta sobre ejercicios?';
    }

    const systemPrompt = `Eres un experto entrenador personal. Tu trabajo es responder SOLO preguntas sobre ejercicios y entrenamiento.

REGLAS ESTRICTAS:
1. SOLO responde preguntas sobre ejercicios, entrenamiento, nutrición deportiva
2. Si te preguntan sobre otros temas, responde: "Solo puedo ayudarte con temas de ejercicios y entrenamiento"
3. Sé específico, profesional y conciso
4. Menciona ejercicios específicos cuando sea relevante
5. Considera el equipamiento del usuario: ${equipment.length > 0 ? equipment.join(', ') : 'Solo peso corporal'}`;

    return await chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question }
    ]);
  }, [chat, validateExerciseQuestion]);

  return {
    initializeModel,
    chat,
    askAboutExercises,
    askQuestion,
    isLoading,
    isModelLoaded,
    loadingProgress,
    error
  };
}

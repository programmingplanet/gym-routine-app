import { Routine } from '@/types';

export const routines: Routine[] = [
  // DÍA 1 - PECHO + TRÍCEPS
  {
    id: 'day1',
    userId: 'shared',
    dayNumber: 1,
    dayName: 'Pecho + Tríceps',
    exercises: [
      {
        id: 'ex1-1',
        name: 'Press de Pecho con Mancuernas',
        imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
        sets: 4,
        reps: '10-12',
        muscleGroup: 'pecho'
      },
      {
        id: 'ex1-2',
        name: 'Aperturas en Banco',
        imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
        sets: 4,
        reps: '12',
        muscleGroup: 'pecho'
      },
      {
        id: 'ex1-3',
        name: 'Press Inclinado con Mancuernas',
        imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
        sets: 3,
        reps: '10',
        muscleGroup: 'pecho'
      },
      {
        id: 'ex1-4',
        name: 'Fondos en Banco',
        imageUrl: 'https://images.unsplash.com/photo-1584863231364-2edc166de576?w=800&q=80',
        sets: 3,
        reps: '12-15',
        muscleGroup: 'tríceps'
      },
      {
        id: 'ex1-5',
        name: 'Press Cerrado con Barra',
        imageUrl: 'https://images.unsplash.com/photo-1577221084712-45b0445d2b00?w=800&q=80',
        sets: 3,
        reps: '10',
        muscleGroup: 'tríceps'
      },
      {
        id: 'ex1-6',
        name: 'Extensión de Tríceps con Mancuerna',
        imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
        sets: 3,
        reps: '12',
        muscleGroup: 'tríceps'
      },
      {
        id: 'ex1-7',
        name: 'Patada de Tríceps',
        imageUrl: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=800&q=80',
        sets: 3,
        reps: '12',
        muscleGroup: 'tríceps'
      },
      {
        id: 'ex1-8',
        name: 'Plancha',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
        sets: 3,
        reps: '45-60s',
        muscleGroup: 'core'
      }
    ]
  },
  // DÍA 2 - ESPALDA + BÍCEPS
  {
    id: 'day2',
    userId: 'shared',
    dayNumber: 2,
    dayName: 'Espalda + Bíceps',
    exercises: [
      {
        id: 'ex2-1',
        name: 'Dominadas',
        imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&q=80',
        sets: 4,
        reps: '6-10',
        muscleGroup: 'espalda'
      },
      {
        id: 'ex2-2',
        name: 'Remo con Barra',
        imageUrl: 'https://images.unsplash.com/photo-1532384816664-01b8b7238c8d?w=800&q=80',
        sets: 4,
        reps: '10',
        muscleGroup: 'espalda'
      },
      {
        id: 'ex2-3',
        name: 'Remo con Mancuerna',
        imageUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&q=80',
        sets: 3,
        reps: '10',
        muscleGroup: 'espalda'
      },
      {
        id: 'ex2-4',
        name: 'Jalón Invertido',
        imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&q=80',
        sets: 3,
        reps: '12',
        muscleGroup: 'espalda'
      },
      {
        id: 'ex2-5',
        name: 'Curl de Bíceps con Barra',
        imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
        sets: 4,
        reps: '10',
        muscleGroup: 'bíceps'
      },
      {
        id: 'ex2-6',
        name: 'Curl Alterno Mancuernas',
        imageUrl: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?w=800&q=80',
        sets: 3,
        reps: '12',
        muscleGroup: 'bíceps'
      },
      {
        id: 'ex2-7',
        name: 'Curl Martillo',
        imageUrl: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=800&q=80',
        sets: 3,
        reps: '12',
        muscleGroup: 'bíceps'
      },
      {
        id: 'ex2-8',
        name: 'Abdominales en Esterilla',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
        sets: 3,
        reps: '20',
        muscleGroup: 'core'
      }
    ]
  },
  // DÍA 3 - PIERNAS + GLÚTEOS
  {
    id: 'day3',
    userId: 'shared',
    dayNumber: 3,
    dayName: 'Piernas + Glúteos',
    exercises: [
      {
        id: 'ex3-1',
        name: 'Sentadilla con Barra',
        imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80',
        sets: 4,
        reps: '10',
        muscleGroup: 'piernas'
      },
      {
        id: 'ex3-2',
        name: 'Peso Muerto Rumano',
        imageUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&q=80',
        sets: 4,
        reps: '10-12',
        muscleGroup: 'piernas'
      },
      {
        id: 'ex3-3',
        name: 'Zancadas con Mancuernas',
        imageUrl: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=800&q=80',
        sets: 3,
        reps: '12',
        muscleGroup: 'piernas'
      },
      {
        id: 'ex3-4',
        name: 'Sentadilla Sumo',
        imageUrl: 'https://images.unsplash.com/photo-1579758682665-53a1a614eea6?w=800&q=80',
        sets: 3,
        reps: '12',
        muscleGroup: 'piernas'
      },
      {
        id: 'ex3-5',
        name: 'Puente de Glúteos',
        imageUrl: 'https://images.unsplash.com/photo-1591258370814-01609b341790?w=800&q=80',
        sets: 3,
        reps: '15',
        muscleGroup: 'glúteos'
      },
      {
        id: 'ex3-6',
        name: 'Elevaciones de Gemelos',
        imageUrl: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=800&q=80',
        sets: 4,
        reps: '20',
        muscleGroup: 'piernas'
      },
      {
        id: 'ex3-7',
        name: 'Peso Muerto Pierna Rígida',
        imageUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&q=80',
        sets: 3,
        reps: '12',
        muscleGroup: 'piernas'
      },
      {
        id: 'ex3-8',
        name: 'Crunch Bicicleta',
        imageUrl: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800&q=80',
        sets: 3,
        reps: '20',
        muscleGroup: 'core'
      }
    ]
  },
  // DÍA 4 - HOMBROS + FULL BODY
  {
    id: 'day4',
    userId: 'shared',
    dayNumber: 4,
    dayName: 'Hombros + Full Body',
    exercises: [
      {
        id: 'ex4-1',
        name: 'Press Militar Mancuernas',
        imageUrl: 'https://images.unsplash.com/photo-1577221084712-45b0445d2b00?w=800&q=80',
        sets: 4,
        reps: '10',
        muscleGroup: 'hombros'
      },
      {
        id: 'ex4-2',
        name: 'Elevaciones Laterales',
        imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
        sets: 3,
        reps: '15',
        muscleGroup: 'hombros'
      },
      {
        id: 'ex4-3',
        name: 'Pájaros',
        imageUrl: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?w=800&q=80',
        sets: 3,
        reps: '12',
        muscleGroup: 'hombros'
      },
      {
        id: 'ex4-4',
        name: 'Press Arnold',
        imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
        sets: 3,
        reps: '10',
        muscleGroup: 'hombros'
      },
      {
        id: 'ex4-5',
        name: 'Encogimientos de Hombros',
        imageUrl: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=800&q=80',
        sets: 4,
        reps: '15',
        muscleGroup: 'hombros'
      },
      {
        id: 'ex4-6',
        name: 'Peso Muerto con Barra',
        imageUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&q=80',
        sets: 3,
        reps: '8',
        muscleGroup: 'fullbody'
      },
      {
        id: 'ex4-7',
        name: 'Sentadilla con Mancuernas',
        imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80',
        sets: 3,
        reps: '12',
        muscleGroup: 'piernas'
      },
      {
        id: 'ex4-8',
        name: 'Plancha Lateral',
        imageUrl: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800&q=80',
        sets: 3,
        reps: '40s',
        muscleGroup: 'core'
      }
    ]
  }
];

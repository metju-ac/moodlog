import type { Reflection } from '$lib/types';

// Mock reflections data
const initialReflections: Reflection[] = [
  {
    id: '1',
    date: new Date('2025-11-03'),
    sleepQuality: 8, // Good sleep
    physicalActivity: 6, // Moderate activity
    socialInteractions: 7, // Pleasant interactions
    pressure: 0, // Neutral pressure
    notes:
      'Had a great day overall. Morning run felt energizing and the team meeting was productive. Felt a bit stressed about the upcoming deadline, but managed to stay focused.',
  },
  {
    id: '2',
    date: new Date('2025-11-02'),
    sleepQuality: 0, // Neutral sleep
    physicalActivity: -7, // Low activity
    socialInteractions: -6, // Awkward interactions
    pressure: 8, // High pressure
    notes:
      "Didn't sleep well due to stress. Spent most of the day sitting. Social interactions felt a bit draining. High pressure from multiple deadlines.",
  },
];

// Reactive state using Svelte 5 runes
let reflections = $state<Reflection[]>(initialReflections);
let selectedDate = $state<Date>(new Date('2025-11-03'));

export const reflectionStore = {
  get all() {
    return reflections;
  },
  get selectedDate() {
    return selectedDate;
  },
  setDate(date: Date) {
    selectedDate = date;
  },
  getReflectionByDate(date: Date): Reflection | undefined {
    return reflections.find((reflection) => reflection.date.toDateString() === date.toDateString());
  },
  addReflection(reflection: Reflection) {
    reflections = [...reflections, reflection];
  },
  updateReflection(id: string, updatedReflection: Reflection) {
    reflections = reflections.map((reflection) =>
      reflection.id === id ? updatedReflection : reflection,
    );
  },
  deleteReflection(id: string) {
    reflections = reflections.filter((reflection) => reflection.id !== id);
  },
  generateId(): string {
    return Date.now().toString();
  },
};

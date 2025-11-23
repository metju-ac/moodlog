import type { Reflection } from '$lib/types';
import { SvelteDate } from 'svelte/reactivity';

// Generate reflections for today and the day before yesterday
function generateReflections(): Reflection[] {
  const today = new SvelteDate();
  today.setHours(0, 0, 0, 0);

  const dayBeforeYesterday = new SvelteDate();
  dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
  dayBeforeYesterday.setHours(0, 0, 0, 0);

  const reflectionNotes = [
    'Had a productive day overall. Managed to balance work and personal time well. Feeling accomplished and ready for tomorrow.',
    "Today was challenging but rewarding. Learned a lot from setbacks and interactions with others. Sleep could have been better, but I'm managing.",
    'A balanced day with good energy levels. Social interactions were positive and uplifting. Looking forward to maintaining this momentum.',
    'Felt a bit stressed today due to workload, but managed to stay focused. Exercise helped clear my mind. Need to prioritize rest.',
    'Great day with plenty of physical activity and quality time with others. Felt energized and motivated throughout the day.',
    'Not the best day sleep-wise, which affected my energy. However, I pushed through and accomplished what I set out to do. Tomorrow will be better.',
  ];

  return [
    {
      id: '1',
      date: today,
      sleepQuality: Math.floor(Math.random() * 13) - 6, // Random between -6 and 6
      physicalActivity: Math.floor(Math.random() * 13) - 6,
      socialInteractions: Math.floor(Math.random() * 13) - 6,
      pressure: Math.floor(Math.random() * 13) - 6,
      notes: reflectionNotes[Math.floor(Math.random() * reflectionNotes.length)],
    },
    {
      id: '2',
      date: dayBeforeYesterday,
      sleepQuality: Math.floor(Math.random() * 13) - 6,
      physicalActivity: Math.floor(Math.random() * 13) - 6,
      socialInteractions: Math.floor(Math.random() * 13) - 6,
      pressure: Math.floor(Math.random() * 13) - 6,
      notes: reflectionNotes[Math.floor(Math.random() * reflectionNotes.length)],
    },
  ];
}

// Mock reflections data
const initialReflections: Reflection[] = generateReflections();

// Reactive state using Svelte 5 runes
let reflections = $state<Reflection[]>(initialReflections);
let selectedDate = $state<Date>(new Date());

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

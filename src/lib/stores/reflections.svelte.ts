import type { Reflection } from '$lib/types';
import { SvelteDate } from 'svelte/reactivity';

// Generate one reflection every other day for ~90 days
function generateReflections(): Reflection[] {
  const reflectionNotes = [
    'Had a productive day overall. Managed to balance work and personal time well. Feeling accomplished and ready for tomorrow.',
    "Today was challenging but rewarding. Learned a lot from setbacks and interactions with others. Sleep could have been better, but I'm managing.",
    'A balanced day with good energy levels. Social interactions were positive and uplifting. Looking forward to maintaining this momentum.',
    'Felt a bit stressed today due to workload, but managed to stay focused. Exercise helped clear my mind. Need to prioritize rest.',
    'Great day with plenty of physical activity and quality time with others. Felt energized and motivated throughout the day.',
    'Not the best day sleep-wise, which affected my energy. However, I pushed through and accomplished what I set out to do. Tomorrow will be better.',
    'Quiet day with minimal social interactions. Used the time for self-reflection and planning. Feel centered and prepared.',
    'Pushed myself physically today with a long workout. Feeling tired but satisfied. Need to balance activity with rest.',
    'Stressful day with lots of pressure from deadlines. Managed to stay calm and prioritize tasks effectively.',
    'Relaxing day with good sleep and low stress. Recharged my batteries and feel ready for the week ahead.',
  ];

  const reflections: Reflection[] = [];
  const now = new Date();

  // Generate reflections every other day for ~90 days (45 reflections)
  for (let i = 1; i <= 90; i += 2) {
    const date = new SvelteDate();
    date.setDate(now.getDate() - i);
    date.setHours(0, 0, 0, 0);

    reflections.push({
      id: String(reflections.length + 1),
      date,
      sleepQuality: Math.floor(Math.random() * 21) - 10, // Random between -10 and 10
      physicalActivity: Math.floor(Math.random() * 21) - 10,
      socialInteractions: Math.floor(Math.random() * 21) - 10,
      pressure: Math.floor(Math.random() * 21) - 10,
      notes: reflectionNotes[Math.floor(Math.random() * reflectionNotes.length)],
    });
  }

  return reflections;
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

import type { Reflection, Label } from '$lib/types';

// Mock labels
export const mockLabels: Label[] = [
  { id: '1', name: 'Free time', icon: '🎮' },
  { id: '2', name: 'School', icon: '🎓' },
  { id: '3', name: 'Work', icon: '💼' },
];

// Mock reflections data
const initialReflections: Reflection[] = [
  {
    id: '1',
    title: 'Pleasant morning',
    description: 'I managed to get up before my alarm clock, and it felt amazing',
    labels: [mockLabels[0]],
    moodLevel: 'positive',
    date: new Date('2025-11-03'),
  },
  {
    id: '2',
    title: 'Zjb',
    description: 'I had to do stuff for school, outrageous',
    labels: [mockLabels[1]],
    moodLevel: 'negative',
    date: new Date('2025-11-03'),
  },
  {
    id: '3',
    title: 'Went to cinema with coleagues',
    description: 'Rewatched my favorite movie "Na Plech" by the briliant director Marty Pohl',
    labels: [mockLabels[2], mockLabels[0]],
    moodLevel: 'positive',
    date: new Date('2025-11-03'),
  },
];

// Reactive state using Svelte 5 runes
let reflections = $state<Reflection[]>(initialReflections);
let selectedDate = $state<Date>(new Date('2025-11-03'));

// Derived state - filter reflections by selected date
const filteredReflections = $derived(
  reflections.filter((r) => r.date.toDateString() === selectedDate.toDateString()),
);

export const reflectionStore = {
  get reflections() {
    return filteredReflections;
  },
  get selectedDate() {
    return selectedDate;
  },
  setDate(date: Date) {
    selectedDate = date;
  },
  addReflection(reflection: Reflection) {
    reflections = [...reflections, reflection];
  },
  deleteReflection(id: string) {
    reflections = reflections.filter((r) => r.id !== id);
  },
};

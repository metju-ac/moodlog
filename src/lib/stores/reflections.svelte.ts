import type { Reflection, Label } from '$lib/types';

// Mock labels
export const mockLabels: Label[] = [
  { id: '1', name: 'Free time', icon: '🎮' },
  { id: '2', name: 'School', icon: '🎓' },
  { id: '3', name: 'Work', icon: '💼' },
];

// Mock reflections data
const initialReflections: Reflection[] = [
  // November 3, 2025
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

  // November 2, 2025
  {
    id: '4',
    title: 'Productive work session',
    description: 'Finished the project milestone ahead of schedule. Team was really happy!',
    labels: [mockLabels[2]],
    moodLevel: 'positive',
    date: new Date('2025-11-02'),
  },
  {
    id: '5',
    title: 'Late night studying',
    description: "Had to pull an all-nighter for tomorrow's exam. Coffee is my best friend now.",
    labels: [mockLabels[1]],
    moodLevel: 'neutral',
    date: new Date('2025-11-02'),
  },

  // November 1, 2025
  {
    id: '6',
    title: 'Weekend gaming marathon',
    description: "Finally beat that boss I've been stuck on for weeks! So satisfying.",
    labels: [mockLabels[0]],
    moodLevel: 'positive',
    date: new Date('2025-11-01'),
  },
  {
    id: '7',
    title: 'Missed deadline',
    description: 'Forgot about the assignment due today. Professor was not happy.',
    labels: [mockLabels[1]],
    moodLevel: 'negative',
    date: new Date('2025-11-01'),
  },

  // October 31, 2025
  {
    id: '8',
    title: 'Halloween party',
    description: 'Amazing costume party with friends. My vampire costume was a hit!',
    labels: [mockLabels[0]],
    moodLevel: 'positive',
    date: new Date('2025-10-31'),
  },
  {
    id: '9',
    title: 'Conference presentation',
    description: 'Presented our research at the company conference. Got great feedback!',
    labels: [mockLabels[2]],
    moodLevel: 'positive',
    date: new Date('2025-10-31'),
  },

  // October 30, 2025
  {
    id: '10',
    title: 'Stressful commute',
    description: 'Traffic was terrible, arrived 30 minutes late to work.',
    labels: [mockLabels[2]],
    moodLevel: 'negative',
    date: new Date('2025-10-30'),
  },
  {
    id: '11',
    title: 'Group study session',
    description: 'Studied with classmates at the library. Finally understanding calculus!',
    labels: [mockLabels[1]],
    moodLevel: 'positive',
    date: new Date('2025-10-30'),
  },

  // October 29, 2025
  {
    id: '12',
    title: 'Quiet day at home',
    description:
      'Just relaxed, read a book, and watched some series. Sometimes doing nothing is the best.',
    labels: [mockLabels[0]],
    moodLevel: 'positive',
    date: new Date('2025-10-29'),
  },
  {
    id: '13',
    title: 'Code review feedback',
    description: 'Got some harsh but fair criticism on my code. Need to improve my practices.',
    labels: [mockLabels[2]],
    moodLevel: 'neutral',
    date: new Date('2025-10-29'),
  },

  // October 28, 2025
  {
    id: '14',
    title: 'Morning workout',
    description: 'Started the day with a great gym session. Feeling energized!',
    labels: [mockLabels[0]],
    moodLevel: 'positive',
    date: new Date('2025-10-28'),
  },
  {
    id: '15',
    title: 'Difficult lecture',
    description: "Today's quantum physics lecture went completely over my head.",
    labels: [mockLabels[1]],
    moodLevel: 'negative',
    date: new Date('2025-10-28'),
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

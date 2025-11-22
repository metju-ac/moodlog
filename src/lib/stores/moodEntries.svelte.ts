import type { MoodEntry } from '$lib/types';
import { labelStore } from './labels.svelte';

// Helper to get labels by id
function getLabelsById(ids: string[]) {
  return ids.map((id) => labelStore.getLabelById(id)).filter((label) => label !== undefined);
}

// Mock mood entries - quick logs recorded throughout the day
const initialMoodEntries: MoodEntry[] = [
  // November 3, 2025
  {
    id: '1',
    title: 'Pleasant morning',
    description: 'I managed to get up before my alarm clock, and it felt amazing',
    labels: getLabelsById(['3']),
    moodLevel: 8, // positive mood
    date: new Date('2025-11-03T07:30:00'),
  },
  {
    id: '2',
    title: 'Zjb',
    description: 'I had to do stuff for school, outrageous',
    labels: getLabelsById(['1']),
    moodLevel: -6, // negative mood
    date: new Date('2025-11-03T14:15:00'),
  },
  {
    id: '3',
    title: 'Went to cinema with coleagues',
    description: 'Rewatched my favorite movie "Na Plech" by the briliant director Marty Pohl',
    labels: getLabelsById(['2', '3']),
    moodLevel: 9, // very positive mood
    date: new Date('2025-11-03T20:45:00'),
  },

  // November 2, 2025
  {
    id: '4',
    title: 'Productive work session',
    description: 'Finished the project milestone ahead of schedule. Team was really happy!',
    labels: getLabelsById(['2']),
    moodLevel: 7, // positive mood
    date: new Date('2025-11-02T10:00:00'),
  },
  {
    id: '5',
    title: 'Late night studying',
    description: "Had to pull an all-nighter for tomorrow's exam. Coffee is my best friend now.",
    labels: getLabelsById(['1']),
    moodLevel: -1, // slightly negative/neutral
    date: new Date('2025-11-02T23:30:00'),
  },

  // November 1, 2025
  {
    id: '6',
    title: 'Weekend gaming marathon',
    description: "Finally beat that boss I've been stuck on for weeks! So satisfying.",
    labels: getLabelsById(['3']),
    moodLevel: 8, // positive mood
    date: new Date('2025-11-01T16:20:00'),
  },
  {
    id: '7',
    title: 'Missed deadline',
    description: 'Forgot about the assignment due today. Professor was not happy.',
    labels: getLabelsById(['1']),
    moodLevel: -7, // negative mood
    date: new Date('2025-11-01T09:00:00'),
  },

  // October 31, 2025
  {
    id: '8',
    title: 'Halloween party',
    description: 'Amazing costume party with friends. My vampire costume was a hit!',
    labels: getLabelsById(['3']),
    moodLevel: 9, // very positive mood
    date: new Date('2025-10-31T19:00:00'),
  },
  {
    id: '9',
    title: 'Conference presentation',
    description: 'Presented our research at the company conference. Got great feedback!',
    labels: getLabelsById(['2']),
    moodLevel: 6, // positive mood
    date: new Date('2025-10-31T14:30:00'),
  },

  // October 30, 2025
  {
    id: '10',
    title: 'Stressful commute',
    description: 'Traffic was terrible, arrived 30 minutes late to work.',
    labels: getLabelsById(['2']),
    moodLevel: -5, // negative mood
    date: new Date('2025-10-30T08:45:00'),
  },
  {
    id: '11',
    title: 'Group study session',
    description: 'Studied with classmates at the library. Finally understanding calculus!',
    labels: getLabelsById(['1']),
    moodLevel: 7, // positive mood
    date: new Date('2025-10-30T18:00:00'),
  },

  // October 29, 2025
  {
    id: '12',
    title: 'Quiet day at home',
    description:
      'Just relaxed, read a book, and watched some series. Sometimes doing nothing is the best.',
    labels: getLabelsById(['3']),
    moodLevel: 5, // moderately positive
    date: new Date('2025-10-29T15:00:00'),
  },
  {
    id: '13',
    title: 'Code review feedback',
    description: 'Got some harsh but fair criticism on my code. Need to improve my practices.',
    labels: getLabelsById(['2']),
    moodLevel: 0, // neutral
    date: new Date('2025-10-29T11:15:00'),
  },

  // October 28, 2025
  {
    id: '14',
    title: 'Morning workout',
    description: 'Started the day with a great gym session. Feeling energized!',
    labels: getLabelsById(['3']),
    moodLevel: 8, // positive mood
    date: new Date('2025-10-28T06:30:00'),
  },
  {
    id: '15',
    title: 'Difficult lecture',
    description: "Today's quantum physics lecture went completely over my head.",
    labels: getLabelsById(['1']),
    moodLevel: -6, // negative mood
    date: new Date('2025-10-28T13:00:00'),
  },
];

// Reactive state using Svelte 5 runes
let moodEntries = $state<MoodEntry[]>(initialMoodEntries);
let selectedDate = $state<Date>(new Date('2025-11-03'));

// Derived state - filter mood entries by selected date and sort by time
const filteredMoodEntries = $derived(
  moodEntries
    .filter((entry) => entry.date.toDateString() === selectedDate.toDateString())
    .sort((a, b) => a.date.getTime() - b.date.getTime()),
);

export const moodEntryStore = {
  get entries() {
    return filteredMoodEntries;
  },
  get selectedDate() {
    return selectedDate;
  },
  setDate(date: Date) {
    selectedDate = date;
  },
  getEntryById(id: string): MoodEntry | undefined {
    return moodEntries.find((entry) => entry.id === id);
  },
  addEntry(entry: MoodEntry) {
    moodEntries = [...moodEntries, entry];
  },
  updateEntry(id: string, updatedEntry: MoodEntry) {
    moodEntries = moodEntries.map((entry) => (entry.id === id ? updatedEntry : entry));
  },
  deleteEntry(id: string) {
    moodEntries = moodEntries.filter((entry) => entry.id !== id);
  },
};

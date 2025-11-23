import type { MoodEntry } from '$lib/types';
import { labelStore } from './labels.svelte';
import { SvelteDate } from 'svelte/reactivity';

// Helper to get labels by id
function getLabelsById(ids: string[]) {
  return ids.map((id) => labelStore.getLabelById(id)).filter((label) => label !== undefined);
}

// Generate test data: 5 entries per day for the last 3 months
function generateTestData(): MoodEntry[] {
  const entries: MoodEntry[] = [];
  const today = new SvelteDate();
  today.setHours(0, 0, 0, 0);
  const daysToGenerate = 90; // 3 months
  const entriesPerDay = 5;

  const titles = [
    'Morning routine',
    'Work meeting',
    'Study session',
    'Gym workout',
    'Coffee break',
    'Project deadline',
    'Team collaboration',
    'Evening walk',
    'Weekend plans',
    'Family time',
    'Reading time',
    'Coding challenge',
    'Lunch with friends',
    'Video call',
    'Creative session',
    'Problem solving',
    'Relaxing evening',
    'Busy afternoon',
    'Productive morning',
    'Quiet moment',
    'Team standup',
    'Quick snack',
    'Phone call',
    'Break time',
    'Commute home',
  ];

  const descriptions = [
    'Had a good day overall',
    'Feeling productive and focused',
    'Challenging but rewarding',
    'Taking it easy today',
    'Lots of energy and motivation',
    'A bit tired but content',
    'Stressed but managing',
    'Peaceful and calm',
    'Excited about progress',
    'Need more rest',
    'Making good progress',
    'Feeling accomplished',
    'Nice and relaxed',
    'Bit overwhelmed',
    'Going well so far',
  ];

  const labelIds = ['1', '2', '3', '4']; // School, Work, Free time, Sport

  let entryId = 0;

  for (let dayOffset = 0; dayOffset < daysToGenerate; dayOffset++) {
    // Base date for this day
    const dayDate = new SvelteDate(today);
    dayDate.setDate(today.getDate() - dayOffset);

    // Create 5 entries for this day at different times
    const entryTimes = [
      { hour: 7, minute: 30 }, // Morning
      { hour: 11, minute: 15 }, // Late morning
      { hour: 14, minute: 0 }, // Afternoon
      { hour: 17, minute: 45 }, // Late afternoon
      { hour: 20, minute: 30 }, // Evening
    ];

    for (let i = 0; i < entriesPerDay; i++) {
      const entryDate = new SvelteDate(dayDate);
      const time = entryTimes[i];
      entryDate.setHours(time.hour, time.minute + Math.floor(Math.random() * 30), 0, 0);

      // Random mood level between -10 and 10
      const moodLevel = Math.floor(Math.random() * 21) - 10;

      // Select 1-2 random labels
      const numLabels = Math.random() > 0.5 ? 1 : 2;
      const selectedLabels: string[] = [];
      for (let j = 0; j < numLabels; j++) {
        const labelId = labelIds[Math.floor(Math.random() * labelIds.length)];
        if (!selectedLabels.includes(labelId)) {
          selectedLabels.push(labelId);
        }
      }

      entries.push({
        id: `test-${entryId++}`,
        title: titles[Math.floor(Math.random() * titles.length)],
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        labels: getLabelsById(selectedLabels),
        moodLevel,
        date: entryDate,
      });
    }
  }

  return entries.sort((a, b) => b.date.getTime() - a.date.getTime());
}

// Mock mood entries - quick logs recorded throughout the day
const initialMoodEntries: MoodEntry[] = generateTestData();

// Reactive state using Svelte 5 runes
let moodEntries = $state<MoodEntry[]>(initialMoodEntries);
let selectedDate = $state<Date>(new Date());

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
  get allEntries() {
    return moodEntries;
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

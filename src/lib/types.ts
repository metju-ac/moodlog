export type Label = {
  id: string;
  name: string;
  icon: string;
};

export type MoodEntry = {
  id: string;
  title: string;
  description: string;
  labels: Label[];
  moodLevel: number; // -10 to +10
  date: Date;
};

export type Reflection = {
  id: string;
  date: Date;
  sleepQuality: number; // -10 to +10
  physicalActivity: number; // -10 to +10
  socialInteractions: number; // -10 to +10
  stress: number; // -10 to +10
  notes: string;
};

export type NavigationTab = 'insights' | 'mood-entries' | 'labels';

export type TimeRange = 'week' | 'month' | '3months' | 'year';

export type ReflectionMetric =
  | 'sleepQuality'
  | 'physicalActivity'
  | 'socialInteractions'
  | 'stress';

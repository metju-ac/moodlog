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
  pressure: number; // -10 to +10
  notes: string;
};

export type NavigationTab = 'insights' | 'reflections' | 'labels';

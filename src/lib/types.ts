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

export type NavigationTab = 'insights' | 'reflections' | 'labels';

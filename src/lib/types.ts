export type MoodLevel = 'positive' | 'neutral' | 'negative';

export type Label = {
  id: string;
  name: string;
  icon: string;
};

export type Reflection = {
  id: string;
  title: string;
  description: string;
  labels: Label[];
  moodLevel: MoodLevel;
  date: Date;
};

export type NavigationTab = 'insights' | 'reflections' | 'labels';

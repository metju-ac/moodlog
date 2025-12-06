import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  GraduationCap,
  Briefcase,
  Puzzle,
  Trophy,
  Heart,
  Home,
  Users,
  Music,
  Book,
  Dumbbell,
  Coffee,
  Plane,
  Star,
  Sun,
  Moon,
  Utensils,
  Gamepad,
  Camera,
  type Icon,
} from '@lucide/svelte';
import { SvelteMap } from 'svelte/reactivity';
import type { MoodEntry } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

// Map icon names to lucide-svelte icon components
const iconMap: Record<string, typeof Icon> = {
  'graduation-cap': GraduationCap,
  briefcase: Briefcase,
  puzzle: Puzzle,
  trophy: Trophy,
  heart: Heart,
  home: Home,
  users: Users,
  music: Music,
  book: Book,
  dumbbell: Dumbbell,
  coffee: Coffee,
  plane: Plane,
  star: Star,
  sun: Sun,
  moon: Moon,
  utensils: Utensils,
  gamepad: Gamepad,
  camera: Camera,
};

export function getIconComponent(iconName: string): typeof Icon {
  return iconMap[iconName] || Puzzle; // Default to Puzzle if icon not found
}

/**
 * Mood color levels with thresholds
 * Maps mood levels (-10 to +10) to specific colors
 */
const MOOD_COLOR_LEVELS = [
  { threshold: -7, color: '#e57373' }, // Red: very negative
  { threshold: -3, color: '#ffb74d' }, // Orange: negative
  { threshold: 2, color: '#fff176' }, // Yellow: neutral
  { threshold: 6, color: '#aed581' }, // Light green: positive
  { threshold: 10, color: '#66bb6a' }, // Green: very positive
] as const;

/**
 * Calculate color hex based on mood level (-10 to +10)
 * Returns a hex color code for the mood
 *
 * @param moodLevel - Mood value from -10 (very negative) to +10 (very positive)
 * @returns Hex color code
 */
export function getMoodColor(moodLevel: number): string {
  for (let i = 0; i < MOOD_COLOR_LEVELS.length; i++) {
    if (moodLevel <= MOOD_COLOR_LEVELS[i].threshold) {
      return MOOD_COLOR_LEVELS[i].color;
    }
  }
  return MOOD_COLOR_LEVELS[MOOD_COLOR_LEVELS.length - 1].color;
}

/**
 * Interpolate between two hex colors
 *
 * @param color1 - First hex color (e.g., "#ff0000")
 * @param color2 - Second hex color (e.g., "#00ff00")
 * @param factor - Interpolation factor between 0 and 1
 * @returns Interpolated hex color
 */
function interpolateColor(color1: string, color2: string, factor: number): string {
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);

  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;

  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Calculate mood color with smooth gradient interpolation between color levels
 * Uses 5 color levels with gradients in between
 *
 * @param moodLevel - Mood value from -10 (very negative) to +10 (very positive)
 * @returns Hex color code with gradient interpolation
 */
export function getMoodColorGradient(moodLevel: number): string {
  // Handle edge cases
  if (moodLevel <= MOOD_COLOR_LEVELS[0].threshold) return MOOD_COLOR_LEVELS[0].color;
  if (moodLevel >= MOOD_COLOR_LEVELS[MOOD_COLOR_LEVELS.length - 1].threshold) {
    return MOOD_COLOR_LEVELS[MOOD_COLOR_LEVELS.length - 1].color;
  }

  // Find the two colors to interpolate between
  for (let i = 0; i < MOOD_COLOR_LEVELS.length - 1; i++) {
    if (moodLevel <= MOOD_COLOR_LEVELS[i + 1].threshold) {
      const lowerThreshold = MOOD_COLOR_LEVELS[i].threshold;
      const upperThreshold = MOOD_COLOR_LEVELS[i + 1].threshold;
      const factor = (moodLevel - lowerThreshold) / (upperThreshold - lowerThreshold);
      return interpolateColor(MOOD_COLOR_LEVELS[i].color, MOOD_COLOR_LEVELS[i + 1].color, factor);
    }
  }

  return MOOD_COLOR_LEVELS[MOOD_COLOR_LEVELS.length - 1].color;
}

/**
 * Group mood entries by day
 *
 * @param entries - Array of mood entries to group
 * @returns Map where keys are date strings (YYYY-MM-DD) and values are arrays of entries for that day
 */
export function groupEntriesByDay(entries: MoodEntry[]): SvelteMap<string, MoodEntry[]> {
  const dayMap = new SvelteMap<string, MoodEntry[]>();

  entries.forEach((entry) => {
    const dateKey = entry.date.toISOString().split('T')[0];
    if (!dayMap.has(dateKey)) {
      dayMap.set(dateKey, []);
    }
    dayMap.get(dateKey)!.push(entry);
  });

  return dayMap;
}

export type DayAverage = {
  date: Date;
  averageMood: number;
  entryCount: number;
};

/**
 * Calculate average mood per day from grouped entries
 *
 * @param dayMap - Map of date strings to mood entries
 * @returns Array of day averages sorted by date
 */
export function calculateDayAverages(dayMap: SvelteMap<string, MoodEntry[]>): DayAverage[] {
  return Array.from(dayMap.entries())
    .map(([dateKey, dayEntries]) => {
      const averageMood =
        dayEntries.reduce((sum, entry) => sum + entry.moodLevel, 0) / dayEntries.length;
      return {
        date: new Date(dateKey + 'T12:00:00'),
        averageMood,
        entryCount: dayEntries.length,
      };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

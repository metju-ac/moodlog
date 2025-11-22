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

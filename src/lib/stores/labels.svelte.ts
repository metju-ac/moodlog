import type { Label } from '$lib/types';

// Initial labels with icon names (we'll use lucide-svelte icons)
const initialLabels: Label[] = [
  { id: '1', name: 'School', icon: 'graduation-cap' },
  { id: '2', name: 'Work', icon: 'briefcase' },
  { id: '3', name: 'Free time', icon: 'puzzle' },
  { id: '4', name: 'Sport', icon: 'trophy' },
];

// Reactive state using Svelte 5 runes
let labels = $state<Label[]>(initialLabels);

export const labelStore = {
  get all() {
    return labels;
  },
  getLabelById(id: string): Label | undefined {
    return labels.find((label) => label.id === id);
  },
  addLabel(label: Label) {
    labels = [...labels, label];
  },
  updateLabel(id: string, updatedLabel: Partial<Label>) {
    labels = labels.map((label) => (label.id === id ? { ...label, ...updatedLabel } : label));
  },
  deleteLabel(id: string) {
    labels = labels.filter((label) => label.id !== id);
  },
  generateId(): string {
    return Math.max(0, ...labels.map((l) => parseInt(l.id, 10))) + 1 + '';
  },
};

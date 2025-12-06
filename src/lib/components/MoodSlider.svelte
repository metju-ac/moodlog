<script lang="ts">
  import Slider from './Slider.svelte';
  import { getMoodColorGradient } from '$lib/utils';

  type Props = {
    value: number; // -100 to 100
    onValueChange: (value: number) => void;
    labels: string[]; // Array of label texts to distribute evenly
    snapToCenter?: boolean; // Whether to snap to center (neutral zone)
  };

  let { value = 0, onValueChange, labels, snapToCenter = true }: Props = $props();

  // Convert slider value (-100 to 100) to mood level (-10 to 10)
  const moodLevel = $derived(value / 10);

  // Get the current mood color with gradient
  const moodColor = $derived(getMoodColorGradient(moodLevel));
</script>

<Slider {value} {onValueChange} {labels} {snapToCenter} color={moodColor} />

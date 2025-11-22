<script lang="ts">
  import type { MoodEntry } from '$lib/types';
  import { getIconComponent } from '$lib/utils';

  type Props = {
    entry: MoodEntry;
  };

  let { entry }: Props = $props();

  // Calculate color based on numeric mood value (-10 to +10)
  // 5 color levels: Red, Orange, Yellow, Light Green, Green
  const moodColor = $derived.by(() => {
    const mood = entry.moodLevel;
    if (mood <= -7) return 'bg-[#e57373]'; // Red: very negative
    if (mood <= -3) return 'bg-[#ffb74d]'; // Orange: negative
    if (mood <= 2) return 'bg-[#fff176]'; // Yellow: neutral
    if (mood <= 6) return 'bg-[#aed581]'; // Light green: positive
    return 'bg-[#66bb6a]'; // Green: very positive
  });

  // Format time as HH:mm
  const formattedTime = $derived.by(() => {
    const hours = entry.date.getHours().toString().padStart(2, '0');
    const minutes = entry.date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  });
</script>

<a
  href={`/entry/${entry.id}`}
  class="flex w-full cursor-pointer items-start overflow-hidden rounded-xl bg-white shadow-md transition-shadow hover:shadow-lg"
>
  <div class="flex flex-1 flex-col gap-1 p-4">
    <div class="flex items-center justify-between">
      <h3 class="text-base font-medium text-gray-900">{entry.title}</h3>
      <span class="text-xs font-medium text-gray-500">{formattedTime}</span>
    </div>
    <p class="text-sm text-gray-900">{entry.description}</p>

    <div class="flex flex-wrap items-center gap-1 py-2">
      {#each entry.labels as label (label.id)}
        {@const IconComponent = getIconComponent(label.icon)}
        <div
          class="flex h-8 items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700"
        >
          <svelte:component this={IconComponent} class="h-4 w-4" strokeWidth={2} />
          <span>{label.name}</span>
        </div>
      {/each}
    </div>
  </div>

  <div class="h-full w-20 {moodColor} border-t border-r border-b"></div>
</a>

<script lang="ts">
  import { base } from '$app/paths';
  import type { MoodEntry } from '$lib/types';
  import { getIconComponent, getMoodColor } from '$lib/utils';

  type Props = {
    entry: MoodEntry;
    clickable?: boolean;
  };

  let { entry, clickable = true }: Props = $props();

  const moodColor = $derived(getMoodColor(entry.moodLevel));

  // Format time as HH:mm
  const formattedTime = $derived.by(() => {
    const hours = entry.date.getHours().toString().padStart(2, '0');
    const minutes = entry.date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  });
</script>

{#snippet cardContent()}
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
          <IconComponent class="h-4 w-4" strokeWidth={2} />
          <span>{label.name}</span>
        </div>
      {/each}
    </div>
  </div>

  <div class="h-full w-20 border-t border-r border-b" style="background-color: {moodColor};"></div>
{/snippet}

{#if clickable}
  <a
    href={`${base}/entry/${entry.id}`}
    class="flex w-full cursor-pointer items-start overflow-hidden rounded-xl bg-[#f4f3fa] shadow-md transition-shadow hover:shadow-lg"
  >
    {@render cardContent()}
  </a>
{:else}
  <div class="flex w-full items-start overflow-hidden rounded-xl bg-[#f4f3fa] shadow-md">
    {@render cardContent()}
  </div>
{/if}

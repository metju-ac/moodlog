<script lang="ts">
  import type { MoodEntry } from '$lib/types';

  type Props = {
    entry: MoodEntry;
  };

  let { entry }: Props = $props();

  const moodColors = {
    positive: 'bg-green-400',
    neutral: 'bg-yellow-300',
    negative: 'bg-red-400',
  };
</script>

<a
  href={`/entry/${entry.id}`}
  class="flex w-full cursor-pointer items-start overflow-hidden rounded-xl bg-white shadow-md transition-shadow hover:shadow-lg"
>
  <div class="flex flex-1 flex-col gap-1 p-4">
    <h3 class="text-base font-medium text-gray-900">{entry.title}</h3>
    <p class="text-sm text-gray-900">{entry.description}</p>

    <div class="flex flex-wrap items-center gap-1 py-2">
      {#each entry.labels as label (label.id)}
        <div
          class="flex h-8 items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700"
        >
          <span>{label.icon}</span>
          <span>{label.name}</span>
        </div>
      {/each}
    </div>
  </div>

  <div class="h-full w-20 {moodColors[entry.moodLevel]} border-t border-r border-b"></div>
</a>

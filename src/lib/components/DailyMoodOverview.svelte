<script lang="ts">
  import { ChevronLeft, ChevronRight } from '@lucide/svelte';
  import MoodGraph from '$lib/components/MoodGraph.svelte';
  import MoodEntryCard from '$lib/components/MoodEntryCard.svelte';
  import { moodEntryStore } from '$lib/stores/moodEntries.svelte';
  import type { MoodEntry } from '$lib/types';

  type Props = {
    date: Date;
  };

  let { date }: Props = $props();

  // Current entry carousel state
  let currentEntryIndex = $state(0);

  // Get mood entries for the selected day
  const dayEntries = $derived.by(() => {
    return moodEntryStore.entries
      .filter((entry: MoodEntry) => {
        return (
          entry.date.getDate() === date.getDate() &&
          entry.date.getMonth() === date.getMonth() &&
          entry.date.getFullYear() === date.getFullYear()
        );
      })
      .sort((a: MoodEntry, b: MoodEntry) => a.date.getTime() - b.date.getTime());
  });

  const currentEntry = $derived(dayEntries[currentEntryIndex]);
  const hasEntries = $derived(dayEntries.length > 0);
  const canGoPrevious = $derived(currentEntryIndex > 0);
  const canGoNext = $derived(currentEntryIndex < dayEntries.length - 1);

  function previousEntry() {
    if (canGoPrevious) {
      currentEntryIndex--;
    }
  }

  function nextEntry() {
    if (canGoNext) {
      currentEntryIndex++;
    }
  }

  // Reset index when date changes
  $effect(() => {
    void date; // Track date changes
    currentEntryIndex = 0;
  });
</script>

{#if hasEntries}
  <!-- Daily Card Preview -->
  <div class="flex w-full flex-col items-end gap-2.5">
    <!-- Navigation Arrows -->
    <div class="flex gap-1.5">
      <button
        type="button"
        onclick={previousEntry}
        disabled={!canGoPrevious}
        class="flex h-12 w-[52px] items-center justify-center rounded-full bg-[#d9dff6] transition-colors hover:bg-[#c5cbe8] disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Previous entry"
      >
        <ChevronLeft class="h-6 w-6 text-[#404659]" strokeWidth={2} />
      </button>
      <button
        type="button"
        onclick={nextEntry}
        disabled={!canGoNext}
        class="flex h-12 w-[52px] items-center justify-center rounded-full bg-[#d9dff6] transition-colors hover:bg-[#c5cbe8] disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Next entry"
      >
        <ChevronRight class="h-6 w-6 text-[#404659]" strokeWidth={2} />
      </button>
    </div>

    <!-- Entry Card -->
    {#if currentEntry}
      <MoodEntryCard entry={currentEntry} clickable={false} />
    {/if}
  </div>

  <!-- Mood Graph -->
  <div class="w-full">
    <MoodGraph entries={dayEntries} selectedEntryId={currentEntry?.id} />
  </div>
{/if}

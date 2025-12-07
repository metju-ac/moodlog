<script lang="ts">
  import { SvelteDate, SvelteSet } from 'svelte/reactivity';
  import { moodEntryStore } from '$lib/stores/moodEntries.svelte';
  import { labelStore } from '$lib/stores/labels.svelte';
  import { getIconComponent } from '$lib/utils';
  import Navigation from '$lib/components/Navigation.svelte';
  import HighlightsCard from '$lib/components/HighlightsCard.svelte';
  import AverageMoodChart from '$lib/components/AverageMoodChart.svelte';
  import MoodEntryCountChart from '$lib/components/MoodEntryCountChart.svelte';
  import type { MoodEntry } from '$lib/types';

  type TimeRange = 'week' | 'month' | '3months' | 'year';

  // State
  let selectedTimeRange = $state<TimeRange>('3months');
  let selectedLabelIds = $state<Set<string>>(new Set());

  // Calculate date range based on selected time range
  const dateRange = $derived.by(() => {
    const now = new Date();
    const end = new SvelteDate(now);
    end.setHours(23, 59, 59, 999);

    const start = new SvelteDate(now);
    switch (selectedTimeRange) {
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        start.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }
    start.setHours(0, 0, 0, 0);

    return { start, end };
  });

  // Filter entries based on date range and selected labels
  const filteredEntries = $derived.by(() => {
    return moodEntryStore.allEntries.filter((entry: MoodEntry) => {
      const inDateRange = entry.date >= dateRange.start && entry.date <= dateRange.end;

      if (!inDateRange) return false;

      // If no labels selected, include all entries
      if (selectedLabelIds.size === 0) return true;

      // Check if entry has any of the selected labels
      return entry.labels.some((label) => selectedLabelIds.has(label.id));
    });
  });

  function toggleLabel(labelId: string) {
    const newSet = new SvelteSet(selectedLabelIds);
    if (newSet.has(labelId)) {
      newSet.delete(labelId);
    } else {
      newSet.add(labelId);
    }
    selectedLabelIds = newSet;
  }
</script>

<svelte:head>
  <title>Insights - MoodLog</title>
</svelte:head>

<div class="flex h-screen flex-col bg-white">
  <main class="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
    <!-- Time Range Selector -->
    <div class="flex flex-wrap gap-2 py-2">
      <button
        type="button"
        onclick={() => (selectedTimeRange = 'week')}
        class="rounded-lg border border-[#c5c6d0] px-3 py-1.5 text-sm font-medium transition-colors {selectedTimeRange ===
        'week'
          ? 'bg-[#d9dff6] text-[#404659]'
          : 'bg-white text-[#44464f] hover:bg-gray-50'}"
      >
        Week
      </button>
      <button
        type="button"
        onclick={() => (selectedTimeRange = 'month')}
        class="rounded-lg border border-[#c5c6d0] px-3 py-1.5 text-sm font-medium transition-colors {selectedTimeRange ===
        'month'
          ? 'bg-[#d9dff6] text-[#404659]'
          : 'bg-white text-[#44464f] hover:bg-gray-50'}"
      >
        Month
      </button>
      <button
        type="button"
        onclick={() => (selectedTimeRange = '3months')}
        class="rounded-lg border border-[#c5c6d0] px-3 py-1.5 text-sm font-medium transition-colors {selectedTimeRange ===
        '3months'
          ? 'bg-[#d9dff6] text-[#404659]'
          : 'bg-white text-[#44464f] hover:bg-gray-50'}"
      >
        3 Months
      </button>
      <button
        type="button"
        onclick={() => (selectedTimeRange = 'year')}
        class="rounded-lg border border-[#c5c6d0] px-3 py-1.5 text-sm font-medium transition-colors {selectedTimeRange ===
        'year'
          ? 'bg-[#d9dff6] text-[#404659]'
          : 'bg-white text-[#44464f] hover:bg-gray-50'}"
      >
        Year
      </button>
    </div>

    <!-- Label Filter -->
    <div class="flex flex-wrap gap-2">
      {#each labelStore.all as label (label.id)}
        {@const IconComponent = getIconComponent(label.icon)}
        {@const isSelected = selectedLabelIds.has(label.id)}
        <button
          type="button"
          onclick={() => toggleLabel(label.id)}
          class="flex items-center gap-2 rounded-lg border border-[#c5c6d0] px-3 py-1.5 text-sm font-medium transition-colors {isSelected
            ? 'bg-[#d9dff6] text-[#404659]'
            : 'bg-white text-[#44464f] hover:bg-gray-50'}"
        >
          <IconComponent class="h-4 w-4" strokeWidth={2} />
          <span>{label.name}</span>
        </button>
      {/each}
    </div>

    <!-- Highlights Card -->
    <HighlightsCard entries={filteredEntries} />

    <!-- Average Mood Chart -->
    <AverageMoodChart entries={filteredEntries} {selectedTimeRange} />

    <!-- Mood Entry Count Chart -->
    <MoodEntryCountChart entries={filteredEntries} {selectedTimeRange} />
  </main>

  <Navigation currentTab="insights" />
</div>

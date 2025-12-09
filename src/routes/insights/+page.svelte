<script lang="ts">
  import { SvelteDate, SvelteSet } from 'svelte/reactivity';
  import { moodEntryStore } from '$lib/stores/moodEntries.svelte';
  import { reflectionStore } from '$lib/stores/reflections.svelte';
  import { labelStore } from '$lib/stores/labels.svelte';
  import { getIconComponent } from '$lib/utils';
  import Navigation from '$lib/components/Navigation.svelte';
  import HelpIcon from '$lib/components/HelpIcon.svelte';
  import HighlightsCard from '$lib/components/HighlightsCard.svelte';
  import AverageMoodChart from '$lib/components/AverageMoodChart.svelte';
  import MoodEntryCountChart from '$lib/components/MoodEntryCountChart.svelte';
  import ReflectionChart from '$lib/components/ReflectionChart.svelte';
  import MoodActivityGraph from '$lib/components/MoodActivityGraph.svelte';
  import type { MoodEntry, Reflection, TimeRange, ReflectionMetric } from '$lib/types';

  // State
  let selectedTimeRange = $state<TimeRange>('3months');
  let selectedLabelIds = $state<Set<string>>(new Set());
  let selectedReflectionMetric = $state<ReflectionMetric>('sleepQuality');

  // Reflection metric options for the selector
  const reflectionMetricOptions: { value: ReflectionMetric; label: string }[] = [
    { value: 'sleepQuality', label: 'Sleep' },
    { value: 'physicalActivity', label: 'Activity' },
    { value: 'socialInteractions', label: 'Social' },
    { value: 'pressure', label: 'Pressure' },
  ];

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

  // Filter reflections based on date range only (no label filtering)
  const filteredReflections = $derived.by(() => {
    return reflectionStore.all.filter((reflection: Reflection) => {
      return reflection.date >= dateRange.start && reflection.date <= dateRange.end;
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
  <main class="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-4 pb-24">
    <!-- Header with Help Icon -->
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-medium text-black">Insights</h1>
      <HelpIcon />
    </div>

    <!-- Filters (Sticky) -->
    <div class="sticky top-0 z-10 -mx-4 flex flex-col gap-2 px-4 py-2">
      <!-- Time Range Selector -->
      <div class="flex flex-wrap gap-2">
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

      <!-- Label Filter (horizontally scrollable) -->
      <div class="-mx-4 overflow-x-auto px-4">
        <div class="flex gap-2">
          {#each labelStore.all as label (label.id)}
            {@const IconComponent = getIconComponent(label.icon)}
            {@const isSelected = selectedLabelIds.has(label.id)}
            <button
              type="button"
              onclick={() => toggleLabel(label.id)}
              class="flex shrink-0 items-center gap-2 rounded-lg border border-[#c5c6d0] px-3 py-1.5 text-sm font-medium transition-colors {isSelected
                ? 'bg-[#d9dff6] text-[#404659]'
                : 'bg-white text-[#44464f] hover:bg-gray-50'}"
            >
              <IconComponent class="h-4 w-4" strokeWidth={2} />
              <span>{label.name}</span>
            </button>
          {/each}
        </div>
      </div>
    </div>

    <!-- Highlights Card -->
    <HighlightsCard entries={filteredEntries} />

    <!-- Mood Activity Graph -->
    <MoodActivityGraph entries={filteredEntries} {selectedTimeRange} />

    <!-- Average Mood Chart -->
    <AverageMoodChart entries={filteredEntries} {selectedTimeRange} />

    <!-- Mood Entry Count Chart -->
    <MoodEntryCountChart entries={filteredEntries} {selectedTimeRange} />

    <!-- Reflection Chart with Metric Selector -->
    <div class="flex flex-col gap-3">
      <!-- Reflection Metric Selector -->
      <div class="flex flex-wrap gap-2">
        {#each reflectionMetricOptions as option (option.value)}
          <button
            type="button"
            onclick={() => (selectedReflectionMetric = option.value)}
            class="rounded-lg border border-[#c5c6d0] px-3 py-1.5 text-sm font-medium transition-colors {selectedReflectionMetric ===
            option.value
              ? 'bg-[#d9dff6] text-[#404659]'
              : 'bg-white text-[#44464f] hover:bg-gray-50'}"
          >
            {option.label}
          </button>
        {/each}
      </div>

      <!-- Reflection Chart -->
      <ReflectionChart
        reflections={filteredReflections}
        {selectedTimeRange}
        selectedMetric={selectedReflectionMetric}
      />
    </div>
  </main>

  <Navigation currentTab="insights" />
</div>

<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import type { MoodEntry, TimeRange } from '$lib/types';
  import { getMoodColorGradient, groupEntriesByDay } from '$lib/utils';
  import { moodEntryStore } from '$lib/stores/moodEntries.svelte';
  import { reflectionStore } from '$lib/stores/reflections.svelte';

  type Props = {
    entries: MoodEntry[];
    selectedTimeRange: TimeRange;
  };

  let { entries, selectedTimeRange }: Props = $props();

  // Calculate the number of days based on time range
  const daysToShow = $derived.by(() => {
    switch (selectedTimeRange) {
      case 'week':
        return 7;
      case 'month':
        return 30;
      case '3months':
        return 90;
      case 'year':
        return 365;
    }
  });

  // Check if we should use week layout (horizontal row)
  const isWeekLayout = $derived(selectedTimeRange === 'week');

  // Check if we should use month layout (calendar-like with weeks as rows)
  const isMonthLayout = $derived(selectedTimeRange === 'month');

  // Generate calendar data for the activity graph
  const calendarData = $derived.by(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Group entries by day and calculate averages
    const dayMap = groupEntriesByDay(entries);
    const dayAverages = new Map<string, { avgMood: number; count: number }>();

    for (const [dateKey, dayEntries] of dayMap) {
      const avgMood =
        dayEntries.reduce((sum, entry) => sum + entry.moodLevel, 0) / dayEntries.length;
      dayAverages.set(dateKey, { avgMood, count: dayEntries.length });
    }

    // Generate flat array of days
    const days: Array<{
      date: Date;
      dateKey: string;
      avgMood: number | null;
      count: number;
    }> = [];

    const currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() - daysToShow + 1);

    while (currentDate <= today) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const dayData = dayAverages.get(dateKey);

      days.push({
        date: new Date(currentDate),
        dateKey,
        avgMood: dayData ? dayData.avgMood : null,
        count: dayData ? dayData.count : 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  });

  // Group days into weeks for grid layout (non-week view)
  const weeksData = $derived.by(() => {
    if (isWeekLayout || isMonthLayout) return [];

    const weeks: Array<
      Array<{
        date: Date;
        dateKey: string;
        avgMood: number | null;
        count: number;
        isEmpty?: boolean;
      }>
    > = [];

    // Start from the first day and pad to align with week start (Sunday)
    const firstDay = calendarData[0];
    if (!firstDay) return weeks;

    const startDayOfWeek = firstDay.date.getDay();

    // Create first week with padding
    let currentWeek: Array<{
      date: Date;
      dateKey: string;
      avgMood: number | null;
      count: number;
      isEmpty?: boolean;
    }> = [];

    // Add empty padding for days before the start
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push({
        date: new Date(0),
        dateKey: `empty-start-${i}`,
        avgMood: null,
        count: 0,
        isEmpty: true,
      });
    }

    // Add all days
    for (const day of calendarData) {
      currentWeek.push(day);

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Pad the last week if needed
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({
          date: new Date(0),
          dateKey: `empty-end-${currentWeek.length}`,
          avgMood: null,
          count: 0,
          isEmpty: true,
        });
      }
      weeks.push(currentWeek);
    }

    return weeks;
  });

  // Get color for a day cell
  function getCellColor(avgMood: number | null, isEmpty?: boolean): string {
    if (isEmpty) return 'transparent';
    if (avgMood === null) return '#ebedf0'; // No data - light gray like GitHub
    return getMoodColorGradient(avgMood);
  }

  // Format date for tooltip
  function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  // Short day label for week view
  function getShortDayLabel(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  // Day labels for grid view
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Cell size based on time range
  const cellSize = $derived.by(() => {
    switch (selectedTimeRange) {
      case '3months':
      case 'year':
        return 18; // Same size for 3 months and year
      default:
        return 18;
    }
  });

  // Gap size based on time range
  const gapSize = $derived.by(() => {
    switch (selectedTimeRange) {
      case '3months':
      case 'year':
        return 2;
      default:
        return 2;
    }
  });

  // Get month labels for the header (grid view only)
  const monthLabels = $derived.by(() => {
    if (isWeekLayout || isMonthLayout) return [];

    const labels: Array<{ month: string; weekIndex: number }> = [];
    let currentMonth = -1;

    weeksData.forEach((week, weekIndex) => {
      // Find first non-empty day in the week
      const firstDay = week.find((day) => !day.isEmpty);
      if (firstDay) {
        const month = firstDay.date.getMonth();
        if (month !== currentMonth) {
          currentMonth = month;
          labels.push({
            month: firstDay.date.toLocaleDateString('en-US', { month: 'short' }),
            weekIndex,
          });
        }
      }
    });

    return labels;
  });

  // Group days into week rows for month layout (weeks as horizontal rows)
  const monthWeeksData = $derived.by(() => {
    if (!isMonthLayout) return [];

    const weeks: Array<
      Array<{
        date: Date;
        dateKey: string;
        avgMood: number | null;
        count: number;
        isEmpty?: boolean;
      }>
    > = [];

    const firstDay = calendarData[0];
    if (!firstDay) return weeks;

    const startDayOfWeek = firstDay.date.getDay();

    // Create first week with padding at the start
    let currentWeek: Array<{
      date: Date;
      dateKey: string;
      avgMood: number | null;
      count: number;
      isEmpty?: boolean;
    }> = [];

    // Add empty padding for days before the start
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push({
        date: new Date(0),
        dateKey: `empty-start-${i}`,
        avgMood: null,
        count: 0,
        isEmpty: true,
      });
    }

    // Add all days
    for (const day of calendarData) {
      currentWeek.push(day);

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Pad the last week if needed
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({
          date: new Date(0),
          dateKey: `empty-end-${currentWeek.length}`,
          avgMood: null,
          count: 0,
          isEmpty: true,
        });
      }
      weeks.push(currentWeek);
    }

    return weeks;
  });

  // Navigate to mood entries page for a specific day
  function handleDayClick(date: Date, isEmpty?: boolean) {
    if (isEmpty) return;
    moodEntryStore.setDate(date);
    reflectionStore.setDate(date);
    goto(`${base}/`);
  }

  // Reference to scrollable container
  let scrollContainer = $state<HTMLDivElement | null>(null);

  // Scroll to the right (most recent data) when mounted or time range changes
  $effect(() => {
    // Access selectedTimeRange to create dependency
    selectedTimeRange;

    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      if (scrollContainer) {
        scrollContainer.scrollLeft = scrollContainer.scrollWidth;
      }
    });
  });
</script>

<div class="rounded-xl border border-[#c5c6d0] bg-white p-4">
  <h3 class="mb-3 text-sm font-semibold text-[#1b1b1f]">Mood Activity</h3>

  {#if isWeekLayout}
    <!-- Week Layout: Horizontal row of 7 days -->
    <div class="flex flex-col gap-2">
      <div class="flex w-full justify-between gap-1">
        {#each calendarData as day (day.dateKey)}
          <button
            type="button"
            onclick={() => handleDayClick(day.date)}
            class="flex flex-1 flex-col items-center gap-1"
          >
            <span class="text-[10px] text-[#44464f]">{getShortDayLabel(day.date)}</span>
            <div
              class="aspect-square w-full max-w-[40px] rounded-md transition-transform hover:scale-105"
              style="background-color: {getCellColor(day.avgMood)};"
              title={`${formatDate(day.date)}\n${day.count > 0 ? `Entries: ${day.count}\nAverage mood: ${day.avgMood?.toFixed(1)}` : 'No entries'}`}
            ></div>
            <span class="text-[10px] text-[#44464f]">{day.date.getDate()}</span>
          </button>
        {/each}
      </div>
    </div>
  {:else if isMonthLayout}
    <!-- Month Layout: Weeks as horizontal rows -->
    <div class="flex flex-col gap-1">
      <!-- Day labels header -->
      <div class="flex justify-between gap-1 px-1">
        {#each dayLabels as label (label)}
          <span class="flex-1 text-center text-[10px] text-[#44464f]">{label}</span>
        {/each}
      </div>

      <!-- Week rows -->
      {#each monthWeeksData as week, weekIndex (weekIndex)}
        <div class="flex w-full justify-between gap-1">
          {#each week as day (day.dateKey)}
            <button
              type="button"
              onclick={() => handleDayClick(day.date, day.isEmpty)}
              class="flex flex-1 flex-col items-center gap-0.5"
              disabled={day.isEmpty}
            >
              <div
                class="aspect-square w-full max-w-[40px] rounded-md transition-transform {day.isEmpty
                  ? ''
                  : 'cursor-pointer hover:scale-105'}"
                style="background-color: {getCellColor(day.avgMood, day.isEmpty)};"
                title={day.isEmpty
                  ? ''
                  : `${formatDate(day.date)}\n${day.count > 0 ? `Entries: ${day.count}\nAverage mood: ${day.avgMood?.toFixed(1)}` : 'No entries'}`}
              ></div>
              <span class="text-[10px] text-[#44464f] {day.isEmpty ? 'invisible' : ''}"
                >{day.date.getDate()}</span
              >
            </button>
          {/each}
        </div>
      {/each}
    </div>
  {:else}
    <!-- Grid Layout: Calendar-style for month/3months/year -->
    <div class="overflow-x-auto" bind:this={scrollContainer}>
      <div class="inline-flex flex-col" style="min-width: fit-content;">
        <!-- Month labels -->
        <div
          class="mb-1 flex text-xs text-[#44464f]"
          style="padding-left: {selectedTimeRange === 'year' ? 28 : 36}px;"
        >
          <div class="relative flex" style="height: 16px;">
            {#each monthLabels as label (label.weekIndex)}
              <span
                class="absolute text-xs whitespace-nowrap"
                style="left: {label.weekIndex * (cellSize + gapSize)}px;"
              >
                {label.month}
              </span>
            {/each}
          </div>
        </div>

        <div class="flex" style="gap: {gapSize}px;">
          <!-- Day labels -->
          <div
            class="flex flex-shrink-0 flex-col text-xs text-[#44464f]"
            style="gap: {gapSize}px; margin-right: {gapSize}px;"
          >
            {#each dayLabels as label, index (index)}
              <div
                class="flex items-center justify-end pr-1"
                style="height: {cellSize}px; width: {selectedTimeRange === 'year' ? 20 : 28}px;"
              >
                {#if index % 2 === 1}
                  <span class="text-[10px]">{label}</span>
                {/if}
              </div>
            {/each}
          </div>

          <!-- Calendar grid -->
          <div class="flex" style="gap: {gapSize}px;">
            {#each weeksData as week, weekIndex (weekIndex)}
              <div class="flex flex-col" style="gap: {gapSize}px;">
                {#each week as day (day.dateKey)}
                  <button
                    type="button"
                    onclick={() => handleDayClick(day.date, day.isEmpty)}
                    class="rounded-sm {day.isEmpty
                      ? 'cursor-default'
                      : 'cursor-pointer'} transition-transform {day.isEmpty
                      ? ''
                      : 'hover:scale-110'}"
                    style="width: {cellSize}px; height: {cellSize}px; background-color: {getCellColor(
                      day.avgMood,
                      day.isEmpty,
                    )};"
                    title={day.isEmpty
                      ? ''
                      : `${formatDate(day.date)}\n${day.count > 0 ? `Entries: ${day.count}\nAverage mood: ${day.avgMood?.toFixed(1)}` : 'No entries'}`}
                    disabled={day.isEmpty}
                    aria-label={day.isEmpty ? '' : `View entries for ${formatDate(day.date)}`}
                  ></button>
                {/each}
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Legend -->
  <div class="mt-3 flex items-center justify-end gap-1 text-xs text-[#44464f]">
    <span>Bad</span>
    <div class="h-[11px] w-[11px] rounded-sm" style="background-color: #ebedf0;"></div>
    <div class="h-[11px] w-[11px] rounded-sm" style="background-color: #e57373;"></div>
    <div class="h-[11px] w-[11px] rounded-sm" style="background-color: #ffb74d;"></div>
    <div class="h-[11px] w-[11px] rounded-sm" style="background-color: #fff176;"></div>
    <div class="h-[11px] w-[11px] rounded-sm" style="background-color: #aed581;"></div>
    <div class="h-[11px] w-[11px] rounded-sm" style="background-color: #66bb6a;"></div>
    <span>Good</span>
  </div>
</div>

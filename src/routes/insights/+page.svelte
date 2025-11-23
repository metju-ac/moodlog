<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import { scaleTime, scaleLinear } from 'd3-scale';
  import { Chart as LayerChart, Svg, Axis, Spline, Tooltip } from 'layerchart';
  import { curveNatural } from 'd3-shape';
  import { SvelteDate, SvelteMap, SvelteSet } from 'svelte/reactivity';
  import { moodEntryStore } from '$lib/stores/moodEntries.svelte';
  import { labelStore } from '$lib/stores/labels.svelte';
  import { getIconComponent } from '$lib/utils';
  import Navigation from '$lib/components/Navigation.svelte';
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

  // Calculate average mood data based on time range
  const chartData = $derived.by(() => {
    if (filteredEntries.length === 0) return [];

    const groupByDay = selectedTimeRange === 'week' || selectedTimeRange === 'month';

    if (groupByDay) {
      // Group by day
      const dayMap = new SvelteMap<string, MoodEntry[]>();

      filteredEntries.forEach((entry) => {
        const dateKey = entry.date.toISOString().split('T')[0];
        if (!dayMap.has(dateKey)) {
          dayMap.set(dateKey, []);
        }
        dayMap.get(dateKey)!.push(entry);
      });

      return Array.from(dayMap.entries())
        .map(([dateKey, entries]) => {
          const averageMood =
            entries.reduce((sum, entry) => sum + entry.moodLevel, 0) / entries.length;
          return {
            date: new Date(dateKey + 'T12:00:00'),
            averageMood,
            entryCount: entries.length,
          };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    } else {
      // Group by week
      const weekMap = new SvelteMap<string, MoodEntry[]>();

      filteredEntries.forEach((entry) => {
        const weekStart = new SvelteDate(entry.date);
        weekStart.setDate(entry.date.getDate() - entry.date.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekKey = weekStart.toISOString().split('T')[0];

        if (!weekMap.has(weekKey)) {
          weekMap.set(weekKey, []);
        }
        weekMap.get(weekKey)!.push(entry);
      });

      return Array.from(weekMap.entries())
        .map(([weekKey, entries]) => {
          const averageMood =
            entries.reduce((sum, entry) => sum + entry.moodLevel, 0) / entries.length;
          return {
            date: new Date(weekKey + 'T12:00:00'),
            averageMood,
            entryCount: entries.length,
          };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    }
  });

  // X-axis domain
  const xDomain = $derived.by(() => {
    if (chartData.length === 0) {
      return [dateRange.start, dateRange.end];
    }
    return [dateRange.start, dateRange.end];
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
          <svelte:component this={IconComponent} class="h-4 w-4" strokeWidth={2} />
          <span>{label.name}</span>
        </button>
      {/each}
    </div>

    <!-- Average Mood Chart -->
    <Card.Root class="w-full">
      <Card.Header>
        <Card.Title class="text-2xl">Average Mood</Card.Title>
        <Card.Description>
          {#if chartData.length > 0}
            Showing {chartData.length} data {chartData.length === 1 ? 'point' : 'points'} with {filteredEntries.length}
            {filteredEntries.length === 1 ? 'entry' : 'entries'}
          {:else}
            No mood entries found for the selected criteria
          {/if}
        </Card.Description>
      </Card.Header>
      <Card.Content>
        {#if chartData.length > 0}
          <div class="h-[300px] w-full">
            <LayerChart
              data={chartData}
              x="date"
              xScale={scaleTime()}
              xDomain={[new SvelteDate(xDomain[0]), new SvelteDate(xDomain[1])]}
              y="averageMood"
              yScale={scaleLinear()}
              yDomain={[-10, 10]}
              padding={{ top: 16, bottom: 32, left: 48, right: 16 }}
            >
              <Svg>
                <!-- Y-axis with mood level labels -->
                <Axis
                  placement="left"
                  grid
                  rule={false}
                  ticks={[-10, -5, 0, 5, 10]}
                  format={(d: number) => {
                    const val = Math.round(d);
                    return val > 0 ? `+${val}` : String(val);
                  }}
                  class="text-xs text-muted-foreground"
                />

                <!-- X-axis with date labels -->
                <Axis
                  placement="bottom"
                  rule={false}
                  ticks={selectedTimeRange === 'week' ? 7 : 6}
                  format={(d: Date) => {
                    if (selectedTimeRange === 'week' || selectedTimeRange === 'month') {
                      return d.toLocaleDateString('en-GB', {
                        month: 'short',
                        day: 'numeric',
                      });
                    } else {
                      // For 3 months and year, show week starting date
                      return d.toLocaleDateString('en-GB', {
                        month: 'short',
                        day: 'numeric',
                      });
                    }
                  }}
                  class="text-xs text-muted-foreground"
                />

                <!-- Line chart -->
                <Spline curve={curveNatural} class="fill-none stroke-[#485e92] stroke-2" />

                <!-- Tooltip -->
                <Tooltip.Root variant="none">
                  {#snippet children({ data })}
                    <div
                      class="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl"
                    >
                      <div class="font-medium">
                        {data.date.toLocaleDateString('en-GB', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div class="mt-1 flex items-center gap-2">
                        <div class="h-2 w-2 rounded-full bg-[#485e92]"></div>
                        <span class="text-muted-foreground">
                          Avg Mood: {data.averageMood > 0 ? '+' : ''}{data.averageMood.toFixed(1)}
                        </span>
                      </div>
                      <div class="mt-0.5 text-[10px] text-muted-foreground">
                        {data.entryCount}
                        {data.entryCount === 1 ? 'entry' : 'entries'}
                      </div>
                    </div>
                  {/snippet}
                </Tooltip.Root>
              </Svg>
            </LayerChart>
          </div>
        {:else}
          <div
            class="flex h-[300px] w-full items-center justify-center text-sm text-muted-foreground"
          >
            No mood entries found for the selected criteria
          </div>
        {/if}
      </Card.Content>
    </Card.Root>
  </main>

  <Navigation currentTab="insights" />
</div>

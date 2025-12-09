<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import { scaleTime, scaleLinear } from 'd3-scale';
  import { Chart as LayerChart, Svg, Axis, Spline, Tooltip, Highlight } from 'layerchart';
  import { curveNatural } from 'd3-shape';
  import { SvelteDate, SvelteMap } from 'svelte/reactivity';
  import {
    groupEntriesByDay,
    getGroupingStrategy,
    getDataDateRange,
    getWeekBounds,
    getMonthBounds,
    formatXAxisLabel,
    selectXAxisTickIndices,
  } from '$lib/utils';
  import type { MoodEntry, TimeRange } from '$lib/types';

  type Props = {
    entries: MoodEntry[];
    selectedTimeRange: TimeRange;
  };

  let { entries, selectedTimeRange }: Props = $props();

  const groupingStrategy = $derived(getGroupingStrategy(selectedTimeRange));
  const dataDateRange = $derived(getDataDateRange(entries));

  // Calculate average mood data with adaptive grouping
  const chartData = $derived.by(() => {
    if (entries.length === 0) return [];

    const dayMap = groupEntriesByDay(entries);
    const sortedDays = Array.from(dayMap.entries())
      .map(([dateKey, dayEntries]) => {
        const averageMood =
          dayEntries.reduce((sum, entry) => sum + entry.moodLevel, 0) / dayEntries.length;
        return {
          date: new Date(dateKey + 'T12:00:00'),
          averageMood,
          entryCount: dayEntries.length,
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (groupingStrategy === 'day') {
      return sortedDays.map((day) => ({ ...day, endDate: undefined }));
    }

    // Group by week or month
    const grouped = new SvelteMap<
      string,
      { date: Date; endDate: Date; totalMood: number; entryCount: number }
    >();

    sortedDays.forEach((day) => {
      const bounds =
        groupingStrategy === 'week' ? getWeekBounds(day.date) : getMonthBounds(day.date);
      const groupKey =
        groupingStrategy === 'week'
          ? bounds.start.toISOString().split('T')[0]
          : `${bounds.start.getFullYear()}-${String(bounds.start.getMonth() + 1).padStart(2, '0')}`;

      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, {
          date: bounds.start,
          endDate: bounds.end,
          totalMood: 0,
          entryCount: 0,
        });
      }

      const group = grouped.get(groupKey)!;
      group.totalMood += day.averageMood * day.entryCount;
      group.entryCount += day.entryCount;
    });

    return Array.from(grouped.values())
      .map((group) => ({
        date: group.date,
        averageMood: group.totalMood / group.entryCount,
        entryCount: group.entryCount,
        endDate: group.endDate,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  });

  // X-axis domain
  const xDomain = $derived.by(() => {
    if (chartData.length === 0) return [new Date(), new Date()];
    const dates = chartData.map((d) => d.date.getTime());
    return [new Date(Math.min(...dates)), new Date(Math.max(...dates))];
  });

  // Select ticks for x-axis
  const xAxisTicks = $derived.by(() => {
    const indices = selectXAxisTickIndices(chartData.length, selectedTimeRange, groupingStrategy);
    return indices.map((i) => chartData[i].date);
  });
</script>

<Card.Root class="w-full">
  <Card.Header>
    <Card.Title class="text-2xl">
      Average Mood
      {#if groupingStrategy === 'week'}
        (by week)
      {:else if groupingStrategy === 'month'}
        (by month)
      {/if}
    </Card.Title>
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
          tooltip={{ mode: 'bisect-x' }}
        >
          <Svg>
            <!-- Y-axis with mood level labels -->
            <Axis
              placement="left"
              grid
              rule={false}
              ticks={[-10, 0, 10]}
              format={(d: number) => {
                const val = Math.round(d);
                if (val >= 7) return 'Good';
                if (val <= -7) return 'Bad';
                if (val >= -3 && val <= 3) return 'Neutral';
                return '';
              }}
              class="text-xs text-muted-foreground"
            />

            <!-- X-axis with date labels -->
            <Axis
              placement="bottom"
              rule={false}
              ticks={xAxisTicks}
              format={(d: Date) => {
                const item = chartData.find((item) => item.date.getTime() === d.getTime());
                if (!item) return '';
                return formatXAxisLabel(
                  item.date,
                  item.endDate,
                  groupingStrategy,
                  selectedTimeRange,
                  dataDateRange,
                );
              }}
              class="text-xs text-muted-foreground"
            />

            <!-- Line chart -->
            <Spline curve={curveNatural} class="fill-none stroke-[#485e92] stroke-2" />
            <Highlight points lines />
          </Svg>

          <!-- Tooltip -->
          <Tooltip.Root variant="none">
            {#snippet children({ data })}
              <div
                class="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl"
              >
                <div class="font-medium">
                  {#if groupingStrategy === 'day'}
                    {data.date.toLocaleDateString('en-GB', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  {:else}
                    {data.date.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                    -
                    {data.endDate.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  {/if}
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
        </LayerChart>
      </div>
    {:else}
      <div class="flex h-[300px] w-full items-center justify-center text-sm text-muted-foreground">
        No mood entries found for the selected criteria
      </div>
    {/if}
  </Card.Content>
</Card.Root>

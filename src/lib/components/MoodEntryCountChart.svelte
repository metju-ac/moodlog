<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import { scaleBand } from 'd3-scale';
  import { Chart as LayerChart, Svg, Axis, Bars } from 'layerchart';
  import { SvelteMap } from 'svelte/reactivity';
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

  // Calculate entry count data with adaptive grouping
  const chartData = $derived.by(() => {
    if (entries.length === 0) return [];

    const dayMap = groupEntriesByDay(entries);
    const sortedDays = Array.from(dayMap.entries())
      .map(([dateKey, dayEntries]) => ({
        date: dateKey,
        count: dayEntries.length,
        dateObj: new Date(dateKey + 'T12:00:00'),
      }))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    if (groupingStrategy === 'day') {
      return sortedDays.map((day) => ({ ...day, endDate: undefined }));
    }

    // Group by week or month
    const grouped = new SvelteMap<
      string,
      { dateObj: Date; endDate: Date; count: number; entries: number[] }
    >();

    sortedDays.forEach((day) => {
      const bounds =
        groupingStrategy === 'week' ? getWeekBounds(day.dateObj) : getMonthBounds(day.dateObj);
      const groupKey =
        groupingStrategy === 'week'
          ? bounds.start.toISOString().split('T')[0]
          : `${bounds.start.getFullYear()}-${String(bounds.start.getMonth() + 1).padStart(2, '0')}`;

      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, {
          dateObj: bounds.start,
          endDate: bounds.end,
          count: 0,
          entries: [],
        });
      }

      const group = grouped.get(groupKey)!;
      group.count += day.count;
      group.entries.push(day.count);
    });

    return Array.from(grouped.values())
      .map((group) => ({
        date: group.dateObj.toISOString().split('T')[0],
        count: group.count,
        dateObj: group.dateObj,
        endDate: group.endDate,
      }))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  });

  // Calculate max count for y-axis domain
  const maxCount = $derived.by(() => {
    if (chartData.length === 0) return 10;
    const max = Math.max(...chartData.map((d) => d.count));
    return Math.ceil(max * 1.1); // Add 10% padding
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
      Entry Count
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
          xScale={scaleBand().padding(0.2)}
          y="count"
          yDomain={[0, maxCount]}
          padding={{ top: 16, bottom: 32, left: 48, right: 16 }}
        >
          <Svg>
            <!-- Y-axis with count labels -->
            <Axis
              placement="left"
              grid
              rule={false}
              ticks={5}
              format={(d: number) => Math.round(d).toString()}
              class="text-xs text-muted-foreground"
            />

            <!-- X-axis with date labels -->
            <Axis
              placement="bottom"
              rule={false}
              ticks={xAxisTicks}
              format={(d: string) => {
                const item = chartData.find((item) => item.date === d);
                if (!item) return d;
                return formatXAxisLabel(
                  item.dateObj,
                  item.endDate,
                  groupingStrategy,
                  selectedTimeRange,
                  dataDateRange,
                );
              }}
              class="text-xs text-muted-foreground"
            />

            <!-- Bar chart -->
            <Bars radius={4} strokeWidth={0} class="fill-[#485e92]" />
          </Svg>
        </LayerChart>
      </div>
    {:else}
      <div class="flex h-[300px] w-full items-center justify-center text-sm text-muted-foreground">
        No mood entries found for the selected criteria
      </div>
    {/if}
  </Card.Content>
</Card.Root>

<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import { scaleTime, scaleLinear } from 'd3-scale';
  import { Chart as LayerChart, Svg, Axis, Spline, Tooltip, Highlight } from 'layerchart';
  import { curveNatural } from 'd3-shape';
  import { SvelteDate } from 'svelte/reactivity';
  import { groupEntriesByDay } from '$lib/utils';
  import type { MoodEntry } from '$lib/types';

  type TimeRange = 'week' | 'month' | '3months' | 'year';

  type Props = {
    entries: MoodEntry[];
    selectedTimeRange: TimeRange;
  };

  let { entries, selectedTimeRange }: Props = $props();

  type ChartDataItem = {
    date: Date;
    averageMood: number;
    entryCount: number;
    endDate?: Date;
  };

  // Determine grouping strategy based on selected time range
  const groupingStrategy = $derived.by(() => {
    // Use day grouping for week and month, week grouping for longer periods
    if (selectedTimeRange === 'week' || selectedTimeRange === 'month') {
      return 'day';
    } else {
      return 'week';
    }
  });

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

    // Group by week
    const grouped = new Map<
      string,
      { date: Date; endDate: Date; totalMood: number; entryCount: number }
    >();

    sortedDays.forEach((day) => {
      // Get the Monday of the week
      const d = new Date(day.date);
      const dayOfWeek = d.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday
      const groupDate = new Date(d);
      groupDate.setDate(d.getDate() + diff);
      groupDate.setHours(12, 0, 0, 0);
      // End date is Sunday
      const endDate = new Date(groupDate);
      endDate.setDate(groupDate.getDate() + 6);
      const groupKey = groupDate.toISOString().split('T')[0];

      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, { date: groupDate, endDate, totalMood: 0, entryCount: 0 });
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

  // Select up to 7 evenly spaced ticks for x-axis
  const xAxisTicks = $derived.by(() => {
    if (chartData.length === 0) return [];
    if (chartData.length <= 7) return chartData.map((d) => d.date);

    // Select evenly spaced ticks
    const ticks: Date[] = [];
    const step = (chartData.length - 1) / 6; // 7 ticks total (including first and last)

    for (let i = 0; i < 7; i++) {
      const index = Math.round(i * step);
      ticks.push(chartData[index].date);
    }

    return ticks;
  });
</script>

<Card.Root class="w-full">
  <Card.Header>
    <Card.Title class="text-2xl">
      Average Mood
      {#if groupingStrategy === 'week'}
        (by week)
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
              ticks={xAxisTicks}
              format={(d: Date) => {
                const item = chartData.find((item) => item.date.getTime() === d.getTime());
                if (!item) return '';

                if (groupingStrategy === 'day') {
                  return item.date.toLocaleDateString('en-GB', {
                    month: 'short',
                    day: 'numeric',
                  });
                } else {
                  // Week grouping: Show week date range: "Jan 1-7"
                  const startDay = item.date.getDate();
                  const endDay = item.endDate!.getDate();
                  const startMonth = item.date.toLocaleDateString('en-GB', { month: 'short' });
                  const endMonth = item.endDate!.toLocaleDateString('en-GB', { month: 'short' });

                  // If same month, show "Jan 1-7", otherwise show "Jan 29-Feb 4"
                  if (startMonth === endMonth) {
                    return `${startMonth} ${startDay}-${endDay}`;
                  } else {
                    return `${startMonth} ${startDay}-${endMonth} ${endDay}`;
                  }
                }
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

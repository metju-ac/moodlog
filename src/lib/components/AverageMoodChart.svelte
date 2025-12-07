<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import { scaleTime, scaleLinear } from 'd3-scale';
  import { Chart as LayerChart, Svg, Axis, Spline, Tooltip } from 'layerchart';
  import { curveNatural } from 'd3-shape';
  import { SvelteDate, SvelteMap } from 'svelte/reactivity';
  import { groupEntriesByDay, calculateDayAverages } from '$lib/utils';
  import type { MoodEntry } from '$lib/types';

  type TimeRange = 'week' | 'month' | '3months' | 'year';

  type Props = {
    entries: MoodEntry[];
    selectedTimeRange: TimeRange;
    dateRange: { start: Date; end: Date };
  };

  let { entries, selectedTimeRange, dateRange }: Props = $props();

  // Calculate average mood data based on time range
  const chartData = $derived.by(() => {
    if (entries.length === 0) return [];

    const groupByDay = selectedTimeRange === 'week' || selectedTimeRange === 'month';

    if (groupByDay) {
      const dayMap = groupEntriesByDay(entries);
      return calculateDayAverages(dayMap);
    } else {
      // Group by week
      const weekMap = new SvelteMap<string, MoodEntry[]>();

      entries.forEach((entry) => {
        const weekStart = new SvelteDate(entry.date);
        weekStart.setDate(entry.date.getDate() - entry.date.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekKey = weekStart.toISOString().split('T')[0];

        if (!weekMap.has(weekKey)) {
          weekMap.set(weekKey, []);
        }
        weekMap.get(weekKey)!.push(entry);
      });

      return calculateDayAverages(weekMap);
    }
  });

  // X-axis domain
  const xDomain = $derived.by(() => {
    return [dateRange.start, dateRange.end];
  });
</script>

<Card.Root class="w-full">
  <Card.Header>
    <Card.Title class="text-2xl">Average Mood</Card.Title>
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
      <div class="flex h-[300px] w-full items-center justify-center text-sm text-muted-foreground">
        No mood entries found for the selected criteria
      </div>
    {/if}
  </Card.Content>
</Card.Root>

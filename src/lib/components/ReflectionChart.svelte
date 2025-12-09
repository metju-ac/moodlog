<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import { scaleTime, scaleLinear } from 'd3-scale';
  import { Chart as LayerChart, Svg, Axis, Spline, Tooltip, Highlight } from 'layerchart';
  import { curveNatural } from 'd3-shape';
  import { SvelteDate, SvelteMap } from 'svelte/reactivity';
  import {
    getGroupingStrategy,
    getDataDateRange,
    getWeekBounds,
    getMonthBounds,
    formatXAxisLabel,
    selectXAxisTickIndices,
  } from '$lib/utils';
  import type { Reflection, TimeRange, ReflectionMetric } from '$lib/types';

  type Props = {
    reflections: Reflection[];
    selectedTimeRange: TimeRange;
    selectedMetric: ReflectionMetric;
  };

  let { reflections, selectedTimeRange, selectedMetric }: Props = $props();

  const groupingStrategy = $derived(getGroupingStrategy(selectedTimeRange));
  const dataDateRange = $derived(getDataDateRange(reflections));

  // Metric display configuration
  const metricConfig: Record<
    ReflectionMetric,
    { title: string; lowLabel: string; highLabel: string }
  > = {
    sleepQuality: { title: 'Sleep Quality', lowLabel: 'Poor', highLabel: 'Excellent' },
    physicalActivity: { title: 'Physical Activity', lowLabel: 'Sedentary', highLabel: 'Active' },
    socialInteractions: {
      title: 'Social Interactions',
      lowLabel: 'Draining',
      highLabel: 'Energizing',
    },
    pressure: { title: 'Pressure Level', lowLabel: 'None', highLabel: 'High' },
  };

  const currentConfig = $derived(metricConfig[selectedMetric]);

  // Group reflections by day (one reflection per day)
  function groupReflectionsByDay(
    items: Reflection[],
  ): SvelteMap<string, { value: number; count: number }> {
    const dayMap = new SvelteMap<string, { value: number; count: number }>();

    items.forEach((reflection) => {
      const dateKey = reflection.date.toISOString().split('T')[0];
      const value = reflection[selectedMetric];

      if (!dayMap.has(dateKey)) {
        dayMap.set(dateKey, { value: 0, count: 0 });
      }
      const entry = dayMap.get(dateKey)!;
      entry.value += value;
      entry.count += 1;
    });

    return dayMap;
  }

  // Calculate chart data with adaptive grouping
  const chartData = $derived.by(() => {
    if (reflections.length === 0) return [];

    const dayMap = groupReflectionsByDay(reflections);
    const sortedDays = Array.from(dayMap.entries())
      .map(([dateKey, data]) => ({
        date: new Date(dateKey + 'T12:00:00'),
        value: data.value / data.count, // Average if multiple per day
        entryCount: data.count,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (groupingStrategy === 'day') {
      return sortedDays.map((day) => ({ ...day, endDate: undefined }));
    }

    // Group by week or month
    const grouped = new SvelteMap<
      string,
      { date: Date; endDate: Date; totalValue: number; entryCount: number }
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
          totalValue: 0,
          entryCount: 0,
        });
      }

      const group = grouped.get(groupKey)!;
      group.totalValue += day.value * day.entryCount;
      group.entryCount += day.entryCount;
    });

    return Array.from(grouped.values())
      .map((group) => ({
        date: group.date,
        value: group.totalValue / group.entryCount,
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
      {currentConfig.title}
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
          y="value"
          yScale={scaleLinear()}
          yDomain={[-6, 6]}
          padding={{ top: 16, bottom: 32, left: 64, right: 16 }}
          tooltip={{ mode: 'bisect-x' }}
        >
          <Svg>
            <!-- Y-axis with metric-specific labels -->
            <Axis
              placement="left"
              grid
              rule={false}
              ticks={[-6, 0, 6]}
              format={(d: number) => {
                const val = Math.round(d);
                if (val >= 5) return currentConfig.highLabel;
                if (val <= -5) return currentConfig.lowLabel;
                if (val >= -1 && val <= 1) return 'Neutral';
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
                    {currentConfig.title}: {data.value > 0 ? '+' : ''}{data.value.toFixed(1)}
                  </span>
                </div>
                <div class="mt-0.5 text-[10px] text-muted-foreground">
                  {data.entryCount}
                  {data.entryCount === 1 ? 'reflection' : 'reflections'}
                </div>
              </div>
            {/snippet}
          </Tooltip.Root>
        </LayerChart>
      </div>
    {:else}
      <div class="flex h-[300px] w-full items-center justify-center text-sm text-muted-foreground">
        No reflections found for the selected criteria
      </div>
    {/if}
  </Card.Content>
</Card.Root>

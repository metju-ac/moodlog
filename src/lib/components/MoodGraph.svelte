<script lang="ts">
  import { Chart, Svg, Axis, Spline, Points } from 'layerchart';
  import { scaleTime, scaleLinear } from 'd3-scale';
  import type { MoodEntry } from '$lib/types';
  import { SvelteDate } from 'svelte/reactivity';

  type Props = {
    entries: MoodEntry[];
    selectedEntryId?: string;
  };

  type ChartPoint = {
    x: number;
    y: number;
    data: {
      date: Date;
      mood: number;
      id: string;
      isSelected: boolean;
    };
  };

  let { entries, selectedEntryId }: Props = $props();

  // Prepare data for LayerChart
  const chartData = $derived.by(() => {
    if (entries.length === 0) return [];

    // Sort entries by time
    const sortedEntries = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());

    return sortedEntries.map((entry) => ({
      date: entry.date,
      mood: entry.moodLevel, // Keep actual mood level (-10 to +10)
      id: entry.id,
      isSelected: entry.id === selectedEntryId,
    }));
  });

  // Create X-axis domain for full day (00:00 to 24:00)
  const xDomain = $derived.by(() => {
    if (chartData.length === 0) return undefined;

    // Get the date from the first entry
    const date = chartData[0].date;
    const startOfDay = new SvelteDate(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new SvelteDate(date);
    endOfDay.setHours(24, 0, 0, 0);

    return [startOfDay, endOfDay];
  });

  // Create scales
  const xScale = scaleTime();
  const yScale = scaleLinear();
</script>

<div class="h-[339px] w-full bg-white">
  {#if chartData.length > 0}
    <Chart
      data={chartData}
      x="date"
      {xScale}
      {xDomain}
      y="mood"
      {yScale}
      yDomain={[-10, 10]}
      padding={{ top: 16, bottom: 32, left: 40, right: 16 }}
    >
      <Svg>
        <!-- Y-axis with mood level labels -->
        <Axis
          placement="left"
          grid
          rule={false}
          ticks={[-10, -5, 0, 5, 10]}
          format={(d) => {
            const val = Math.round(d as number);
            return val > 0 ? `+${val}` : String(val);
          }}
          class="text-[11px] text-[#a1a9bc]"
        />

        <!-- X-axis with time labels -->
        <Axis
          placement="bottom"
          rule={false}
          ticks={5}
          format={(d) => {
            const date = new Date(d as number);
            return date.toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            });
          }}
          class="text-[11px] text-[#a1a9bc]"
        />

        <!-- Line chart -->
        <Spline class="fill-none stroke-[#485e92] stroke-2" />

        <!-- Data points -->
        <Points r={4} fill="#485e92">
          {#snippet children({ points }: { points: ChartPoint[] })}
            {#each points as point (point.data.id)}
              {@const pointData = point.data}
              <circle
                cx={point.x}
                cy={point.y}
                r={pointData.isSelected ? 6 : 4}
                fill="#485e92"
                stroke={pointData.isSelected ? 'white' : 'none'}
                stroke-width={pointData.isSelected ? 2 : 0}
              />
            {/each}
          {/snippet}
        </Points>
      </Svg>
    </Chart>
  {:else}
    <div class="flex h-full w-full items-center justify-center text-sm text-gray-400">
      No mood entries for this day
    </div>
  {/if}
</div>

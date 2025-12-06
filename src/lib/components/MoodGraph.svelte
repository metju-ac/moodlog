<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import { scaleTime, scaleLinear } from 'd3-scale';
  import { Chart as LayerChart, Svg, Axis, Spline, Points, Tooltip } from 'layerchart';
  import { curveNatural } from 'd3-shape';
  import { SvelteDate } from 'svelte/reactivity';
  import type { MoodEntry } from '$lib/types';

  type Props = {
    entries: MoodEntry[];
    selectedEntryId?: string;
    onPointClick?: (entryId: string) => void;
  };

  type ChartPoint = {
    x: number;
    y: number;
    data: {
      date: Date;
      mood: number;
      id: string;
      title: string;
      isSelected: boolean;
    };
  };

  let { entries, selectedEntryId, onPointClick }: Props = $props();

  // Prepare data for LayerChart
  const chartData = $derived.by(() => {
    if (entries.length === 0) return [];

    // Sort entries by time
    const sortedEntries = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());

    return sortedEntries.map((entry) => ({
      date: entry.date,
      mood: entry.moodLevel, // Keep actual mood level (-10 to +10)
      id: entry.id,
      title: entry.title,
      isSelected: entry.id === selectedEntryId,
    }));
  });

  // Create X-axis domain for full day (00:00 to 24:00)
  const xDomain = $derived.by(() => {
    if (chartData.length === 0) {
      // Default to today if no data
      const today = new Date();
      const startOfDay = new SvelteDate(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new SvelteDate(today);
      endOfDay.setHours(24, 0, 0, 0);
      return [startOfDay, endOfDay];
    }

    // Get the date from the first entry
    const date = chartData[0].date;
    const startOfDay = new SvelteDate(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new SvelteDate(date);
    endOfDay.setHours(24, 0, 0, 0);

    return [startOfDay, endOfDay];
  });
</script>

<Card.Root class="w-full">
  <Card.Header>
    <Card.Title>Daily Mood Overview</Card.Title>
  </Card.Header>
  <Card.Content>
    {#if chartData.length > 0}
      <div class="h-[300px] w-full">
        <LayerChart
          data={chartData}
          x="date"
          xScale={scaleTime()}
          {xDomain}
          y="mood"
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

            <!-- X-axis with time labels -->
            <Axis
              placement="bottom"
              rule={false}
              ticks={7}
              format={(d: Date) => {
                return d.toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                });
              }}
              class="text-xs text-muted-foreground"
            />

            <!-- Line chart -->
            <Spline curve={curveNatural} class="fill-none stroke-[#485e92] stroke-2" />

            <!-- Data points -->
            <Points r={4} fill="#485e92">
              {#snippet children({ points }: { points: ChartPoint[] })}
                {#each points as point (point.data.id)}
                  {@const pointData = point.data}
                  <g
                    role="button"
                    tabindex="0"
                    aria-label="Select entry: {pointData.title}"
                    class="cursor-pointer"
                    onclick={() => onPointClick?.(pointData.id)}
                    onkeydown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onPointClick?.(pointData.id);
                      }
                    }}
                  >
                    <!-- Invisible larger touch target (48x48px) -->
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="24"
                      fill="transparent"
                      class="touch-manipulation"
                    />
                    <!-- Visible data point with touch feedback -->
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={pointData.isSelected ? 9 : 4}
                      fill="#485e92"
                      stroke={pointData.isSelected ? 'white' : 'none'}
                      stroke-width={pointData.isSelected ? 3 : 0}
                      class="group-active:r-[8] pointer-events-none transition-all duration-200"
                    />
                  </g>
                {/each}
              {/snippet}
            </Points>

            <!-- Tooltip -->
            <Tooltip.Root variant="none">
              {#snippet children({ data })}
                <div
                  class="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl"
                >
                  <div class="font-medium">{data.title}</div>
                  <div class="mt-1 flex items-center gap-2">
                    <div class="h-2 w-2 rounded-full bg-[#485e92]"></div>
                    <span class="text-muted-foreground">
                      Mood: {data.mood > 0 ? '+' : ''}{data.mood}
                    </span>
                  </div>
                  <div class="mt-0.5 text-[10px] text-muted-foreground">
                    {data.date.toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </div>
                </div>
              {/snippet}
            </Tooltip.Root>
          </Svg>
        </LayerChart>
      </div>
    {:else}
      <div class="flex h-[300px] w-full items-center justify-center text-sm text-muted-foreground">
        No mood entries for this day
      </div>
    {/if}
  </Card.Content>
</Card.Root>

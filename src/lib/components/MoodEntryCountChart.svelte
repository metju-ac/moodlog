<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import { scaleBand } from 'd3-scale';
  import { Chart as LayerChart, Svg, Axis, Bars, Tooltip, Highlight } from 'layerchart';
  import { groupEntriesByDay } from '$lib/utils';
  import type { MoodEntry } from '$lib/types';

  type Props = {
    entries: MoodEntry[];
  };

  let { entries }: Props = $props();

  type ChartDataItem = {
    date: string;
    count: number;
    dateObj: Date;
    endDate?: Date;
  };

  // Determine grouping strategy based on date range
  const groupingStrategy = $derived.by(() => {
    if (entries.length === 0) return 'day';

    const dayMap = groupEntriesByDay(entries);
    const dates = Array.from(dayMap.keys()).sort();
    if (dates.length === 0) return 'day';

    const firstDate = new Date(dates[0] + 'T12:00:00');
    const lastDate = new Date(dates[dates.length - 1] + 'T12:00:00');
    const daysDiff = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 14) return 'day';
    if (daysDiff <= 60) return 'week';
    return 'month';
  });

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
    const grouped = new Map<
      string,
      { dateObj: Date; endDate: Date; count: number; entries: number[] }
    >();

    sortedDays.forEach((day) => {
      let groupKey: string;
      let groupDate: Date;
      let endDate: Date;

      if (groupingStrategy === 'week') {
        // Get the Monday of the week
        const d = new Date(day.dateObj);
        const dayOfWeek = d.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday
        groupDate = new Date(d);
        groupDate.setDate(d.getDate() + diff);
        groupDate.setHours(0, 0, 0, 0);
        // End date is Sunday
        endDate = new Date(groupDate);
        endDate.setDate(groupDate.getDate() + 6);
        groupKey = groupDate.toISOString().split('T')[0];
      } else {
        // Group by month
        groupDate = new Date(day.dateObj.getFullYear(), day.dateObj.getMonth(), 1);
        // End date is last day of month
        endDate = new Date(day.dateObj.getFullYear(), day.dateObj.getMonth() + 1, 0);
        groupKey = `${groupDate.getFullYear()}-${String(groupDate.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, { dateObj: groupDate, endDate, count: 0, entries: [] });
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
          tooltip={{ mode: 'band' }}
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
              format={(d: string) => {
                const item = chartData.find((item) => item.date === d);
                if (!item) return d;

                if (groupingStrategy === 'day') {
                  return item.dateObj.toLocaleDateString('en-GB', {
                    month: 'short',
                    day: 'numeric',
                  });
                } else if (groupingStrategy === 'week') {
                  // Show week date range: "Jan 1-7"
                  const startDay = item.dateObj.getDate();
                  const endDay = item.endDate!.getDate();
                  const startMonth = item.dateObj.toLocaleDateString('en-GB', { month: 'short' });
                  const endMonth = item.endDate!.toLocaleDateString('en-GB', { month: 'short' });

                  // If same month, show "Jan 1-7", otherwise show "Jan 29-Feb 4"
                  if (startMonth === endMonth) {
                    return `${startMonth} ${startDay}-${endDay}`;
                  } else {
                    return `${startMonth} ${startDay}-${endMonth} ${endDay}`;
                  }
                } else {
                  // Show month date range: "Jan 1-31"
                  const startDay = item.dateObj.getDate();
                  const endDay = item.endDate!.getDate();
                  const month = item.dateObj.toLocaleDateString('en-GB', { month: 'short' });
                  return `${month} ${startDay}-${endDay}`;
                }
              }}
              class="text-xs text-muted-foreground"
            />

            <!-- Bar chart -->
            <Bars radius={4} strokeWidth={0} class="fill-[#485e92]" />
          </Svg>

          <!-- Tooltip -->
          <Tooltip.Root>
            {#snippet children({ data })}
              <div
                class="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl"
              >
                <div class="font-medium">
                  {#if groupingStrategy === 'day'}
                    {data.dateObj.toLocaleDateString('en-GB', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  {:else if groupingStrategy === 'week'}
                    {data.dateObj.toLocaleDateString('en-GB', {
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
                  {:else}
                    {data.dateObj.toLocaleDateString('en-GB', {
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
                    {data.count}
                    {data.count === 1 ? 'entry' : 'entries'}
                  </span>
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

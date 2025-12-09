<script lang="ts">
  import type { MoodEntry, TimeRange } from '$lib/types';
  import { getMoodColorGradient, groupEntriesByDay } from '$lib/utils';

  type Props = {
    entries: MoodEntry[];
    selectedTimeRange: TimeRange;
  };

  let { entries, selectedTimeRange }: Props = $props();

  // Calculate the number of weeks to show based on time range
  const weeksToShow = $derived.by(() => {
    switch (selectedTimeRange) {
      case 'week':
        return 1;
      case 'month':
        return 5;
      case '3months':
        return 13;
      case 'year':
        return 53;
    }
  });

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

    // Calculate total days to show
    const totalDays = weeksToShow * 7;

    // Find the end date (today) and start date
    const endDate = new Date(today);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - totalDays + 1);

    // Adjust start to the beginning of the week (Sunday)
    const startDayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDayOfWeek);

    // Generate all weeks
    const weeks: Array<
      Array<{
        date: Date;
        dateKey: string;
        avgMood: number | null;
        count: number;
        isInRange: boolean;
      }>
    > = [];

    const currentDate = new Date(startDate);
    const rangeStart = new Date(today);
    rangeStart.setDate(rangeStart.getDate() - totalDays + 1);

    while (currentDate <= endDate) {
      const week: Array<{
        date: Date;
        dateKey: string;
        avgMood: number | null;
        count: number;
        isInRange: boolean;
      }> = [];

      for (let day = 0; day < 7; day++) {
        const dateKey = currentDate.toISOString().split('T')[0];
        const dayData = dayAverages.get(dateKey);
        const isInRange = currentDate >= rangeStart && currentDate <= today;

        week.push({
          date: new Date(currentDate),
          dateKey,
          avgMood: dayData ? dayData.avgMood : null,
          count: dayData ? dayData.count : 0,
          isInRange,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      weeks.push(week);
    }

    return weeks;
  });

  // Get color for a day cell
  function getCellColor(avgMood: number | null, isInRange: boolean): string {
    if (!isInRange) return 'transparent';
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

  // Day labels
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get month labels for the header
  const monthLabels = $derived.by(() => {
    const labels: Array<{ month: string; colStart: number }> = [];
    let currentMonth = -1;

    calendarData.forEach((week, weekIndex) => {
      // Check the first day of the week that's in range
      const firstInRangeDay = week.find((day) => day.isInRange);
      if (firstInRangeDay) {
        const month = firstInRangeDay.date.getMonth();
        if (month !== currentMonth) {
          currentMonth = month;
          labels.push({
            month: firstInRangeDay.date.toLocaleDateString('en-US', { month: 'short' }),
            colStart: weekIndex,
          });
        }
      }
    });

    return labels;
  });
</script>

<div class="rounded-xl border border-[#c5c6d0] bg-white p-4">
  <h3 class="mb-3 text-sm font-semibold text-[#1b1b1f]">Mood Activity</h3>

  <div class="overflow-x-auto">
    <div class="inline-block min-w-max">
      <!-- Month labels -->
      <div class="mb-1 flex text-xs text-[#44464f]" style="padding-left: 28px;">
        {#each monthLabels as label, index (index)}
          <span
            class="absolute text-xs"
            style="margin-left: {label.colStart * 13}px; position: relative;"
          >
            {label.month}
          </span>
        {/each}
      </div>

      <div class="mt-4 flex gap-0.5">
        <!-- Day labels -->
        <div class="mr-1 flex flex-col gap-0.5 text-xs text-[#44464f]">
          {#each dayLabels as label, index (index)}
            <div class="flex h-[11px] w-5 items-center justify-end pr-1">
              {#if index % 2 === 1}
                <span class="text-[10px]">{label}</span>
              {/if}
            </div>
          {/each}
        </div>

        <!-- Calendar grid -->
        {#each calendarData as week, weekIndex (weekIndex)}
          <div class="flex flex-col gap-0.5">
            {#each week as day (day.dateKey)}
              <div
                class="h-[11px] w-[11px] rounded-sm {day.isInRange
                  ? 'cursor-pointer'
                  : ''} transition-transform hover:scale-110"
                style="background-color: {getCellColor(day.avgMood, day.isInRange)};"
                title={day.isInRange
                  ? `${formatDate(day.date)}\n${day.count > 0 ? `Entries: ${day.count}\nAverage mood: ${day.avgMood?.toFixed(1)}` : 'No entries'}`
                  : ''}
              ></div>
            {/each}
          </div>
        {/each}
      </div>

      <!-- Legend -->
      <div class="mt-3 flex items-center justify-end gap-1 text-xs text-[#44464f]">
        <span>Less</span>
        <div class="h-[11px] w-[11px] rounded-sm" style="background-color: #ebedf0;"></div>
        <div class="h-[11px] w-[11px] rounded-sm" style="background-color: #e57373;"></div>
        <div class="h-[11px] w-[11px] rounded-sm" style="background-color: #ffb74d;"></div>
        <div class="h-[11px] w-[11px] rounded-sm" style="background-color: #fff176;"></div>
        <div class="h-[11px] w-[11px] rounded-sm" style="background-color: #aed581;"></div>
        <div class="h-[11px] w-[11px] rounded-sm" style="background-color: #66bb6a;"></div>
        <span>More</span>
      </div>
    </div>
  </div>
</div>

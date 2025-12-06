<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import { getIconComponent, groupEntriesByDay, calculateDayAverages } from '$lib/utils';
  import type { MoodEntry } from '$lib/types';
  import { SvelteMap } from 'svelte/reactivity';

  type Props = {
    entries: MoodEntry[];
  };

  let { entries }: Props = $props();

  type DayHighlight = {
    date: Date;
    averageMood: number;
  };

  type TagHighlight = {
    name: string;
    icon: string;
    count: number;
  };

  const highlights = $derived.by(() => {
    if (entries.length === 0) {
      return {
        bestDay: null as DayHighlight | null,
        worstDay: null as DayHighlight | null,
        mostCommonTag: null as TagHighlight | null,
      };
    }

    // Use utility functions to group entries by day and calculate averages
    const dayMap = groupEntriesByDay(entries);
    const dayAverages = calculateDayAverages(dayMap);

    // Find best and worst day
    let bestDay: DayHighlight = dayAverages[0];
    let worstDay: DayHighlight = dayAverages[0];

    dayAverages.forEach((day) => {
      if (day.averageMood > bestDay.averageMood) {
        bestDay = day;
      }
      if (day.averageMood < worstDay.averageMood) {
        worstDay = day;
      }
    });

    const labelCounts = new SvelteMap<string, TagHighlight>();
    entries.forEach((entry) => {
      entry.labels.forEach((label) => {
        const existing = labelCounts.get(label.id);
        if (existing) {
          existing.count++;
        } else {
          labelCounts.set(label.id, {
            name: label.name,
            icon: label.icon,
            count: 1,
          });
        }
      });
    });

    let mostCommonTag: TagHighlight | null = null;
    labelCounts.forEach((labelData) => {
      if (!mostCommonTag || labelData.count > mostCommonTag.count) {
        mostCommonTag = labelData;
      }
    });

    return {
      bestDay,
      worstDay,
      mostCommonTag,
    };
  });

  function formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  function formatMood(mood: number): string {
    return mood > 0 ? `+${mood.toFixed(1)}` : mood.toFixed(1);
  }
</script>

<Card.Root class="w-full">
  <Card.Header>
    <Card.Title class="text-2xl">Highlights</Card.Title>
  </Card.Header>
  <Card.Content>
    {#if entries.length === 0}
      <div class="text-sm text-muted-foreground">
        No mood entries found for the selected criteria
      </div>
    {:else}
      <div class="grid gap-4">
        <!-- Best Day -->
        {#if highlights.bestDay}
          <div class="flex items-start justify-between">
            <div>
              <div class="text-sm font-medium text-muted-foreground">Best Day</div>
              <div class="mt-1 text-lg font-semibold">
                {formatDate(highlights.bestDay.date)}
              </div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-green-600">
                {formatMood(highlights.bestDay.averageMood)}
              </div>
              <div class="text-xs text-muted-foreground">avg mood</div>
            </div>
          </div>
        {/if}

        <!-- Worst Day -->
        {#if highlights.worstDay}
          <div class="flex items-start justify-between border-t border-border pt-4">
            <div>
              <div class="text-sm font-medium text-muted-foreground">Worst Day</div>
              <div class="mt-1 text-lg font-semibold">
                {formatDate(highlights.worstDay.date)}
              </div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-red-600">
                {formatMood(highlights.worstDay.averageMood)}
              </div>
              <div class="text-xs text-muted-foreground">avg mood</div>
            </div>
          </div>
        {/if}

        <!-- Most Common Tag -->
        {#if highlights.mostCommonTag}
          {@const IconComponent = getIconComponent(highlights.mostCommonTag.icon)}
          <div class="flex items-start justify-between border-t border-border pt-4">
            <div>
              <div class="text-sm font-medium text-muted-foreground">Most Common Context</div>
              <div class="mt-1 flex items-center gap-2">
                <IconComponent class="h-5 w-5" strokeWidth={2} />
                <span class="text-lg font-semibold">{highlights.mostCommonTag.name}</span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-[#485e92]">
                {highlights.mostCommonTag.count}
              </div>
              <div class="text-xs text-muted-foreground">
                {highlights.mostCommonTag.count === 1 ? 'entry' : 'entries'}
              </div>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </Card.Content>
</Card.Root>

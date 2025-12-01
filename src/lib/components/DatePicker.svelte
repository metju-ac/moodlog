<script lang="ts">
  import { ChevronLeft, ChevronRight, X } from '@lucide/svelte';
  import { fade, scale } from 'svelte/transition';

  type Props = {
    isOpen: boolean;
    selectedDate: Date;
    onClose: () => void;
    onSelectDate: (date: Date) => void;
  };

  let { isOpen, selectedDate, onClose, onSelectDate }: Props = $props();

  let viewMonth = $state(selectedDate.getMonth());
  let viewYear = $state(selectedDate.getFullYear());

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  // Get days in month
  function getDaysInMonth(month: number, year: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  // Get first day of month (0 = Monday, 6 = Sunday)
  function getFirstDayOfMonth(month: number, year: number): number {
    const day = new Date(year, month, 1).getDay();
    // Convert from Sunday-first (0=Sun) to Monday-first (0=Mon)
    return day === 0 ? 6 : day - 1;
  }

  // Generate calendar grid
  const calendarDays = $derived.by(() => {
    const daysInMonth = getDaysInMonth(viewMonth, viewYear);
    const firstDay = getFirstDayOfMonth(viewMonth, viewYear);
    const days: (number | null)[] = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  });

  function previousMonth() {
    if (viewMonth === 0) {
      viewMonth = 11;
      viewYear--;
    } else {
      viewMonth--;
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      viewMonth = 0;
      viewYear++;
    } else {
      viewMonth++;
    }
  }

  function selectDay(day: number) {
    const newDate = new Date(viewYear, viewMonth, day);
    onSelectDate(newDate);
    onClose();
  }

  function isSelectedDate(day: number): boolean {
    return (
      day === selectedDate.getDate() &&
      viewMonth === selectedDate.getMonth() &&
      viewYear === selectedDate.getFullYear()
    );
  }

  function isToday(day: number): boolean {
    const today = new Date();
    return (
      day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()
    );
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    transition:fade={{ duration: 200 }}
    onclick={handleBackdropClick}
  >
    <div
      class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
      transition:scale={{ duration: 200, start: 0.95 }}
    >
      <!-- Header -->
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-900">Select Date</h2>
        <button
          onclick={onClose}
          class="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100"
          aria-label="Close"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Month/Year Navigation -->
      <div class="mb-4 flex items-center justify-between">
        <button
          onclick={previousMonth}
          class="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100"
          aria-label="Previous month"
        >
          <ChevronLeft class="h-5 w-5" />
        </button>

        <div class="text-base font-medium text-gray-900">
          {monthNames[viewMonth]}
          {viewYear}
        </div>

        <button
          onclick={nextMonth}
          class="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100"
          aria-label="Next month"
        >
          <ChevronRight class="h-5 w-5" />
        </button>
      </div>

      <!-- Day Names -->
      <div class="mb-2 grid grid-cols-7 gap-1">
        {#each dayNames as dayName, index (index)}
          <div class="text-center text-xs font-medium text-gray-500">
            {dayName}
          </div>
        {/each}
      </div>

      <!-- Calendar Grid -->
      <div class="grid grid-cols-7 gap-1">
        {#each calendarDays as day, index (index)}
          {#if day === null}
            <div class="aspect-square"></div>
          {:else}
            <button
              onclick={() => selectDay(day)}
              class="aspect-square rounded-lg text-sm font-medium transition-colors
                {isSelectedDate(day)
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : isToday(day)
                  ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                  : 'text-gray-700 hover:bg-gray-100'}"
            >
              {day}
            </button>
          {/if}
        {/each}
      </div>

      <!-- Today Button -->
      <div class="mt-4 flex justify-end">
        <button
          onclick={() => {
            const today = new Date();
            onSelectDate(today);
            onClose();
          }}
          class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
        >
          Today
        </button>
      </div>
    </div>
  </div>
{/if}

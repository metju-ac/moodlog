<script lang="ts">
  import { Calendar, ChevronLeft, ChevronRight, Plus } from '@lucide/svelte';
  import Navigation from '$lib/components/Navigation.svelte';
  import MoodEntryCard from '$lib/components/MoodEntryCard.svelte';
  import DatePicker from '$lib/components/DatePicker.svelte';
  import FloatingActionButton from '$lib/components/FloatingActionButton.svelte';
  import { moodEntryStore } from '$lib/stores/moodEntries.svelte';
  import { reflectionStore } from '$lib/stores/reflections.svelte';
  import { SvelteDate } from 'svelte/reactivity';

  let isDatePickerOpen = $state(false);

  const formattedDate = $derived(
    moodEntryStore.selectedDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
  );

  function previousDay() {
    const newDate = new SvelteDate(moodEntryStore.selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    moodEntryStore.setDate(newDate);
    reflectionStore.setDate(newDate);
  }

  function nextDay() {
    const newDate = new SvelteDate(moodEntryStore.selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    moodEntryStore.setDate(newDate);
    reflectionStore.setDate(newDate);
  }

  function openDatePicker() {
    isDatePickerOpen = true;
  }

  function closeDatePicker() {
    isDatePickerOpen = false;
  }

  function handleDateSelect(date: Date) {
    moodEntryStore.setDate(date);
    reflectionStore.setDate(date);
  }

  // Check if there's a reflection for the selected date
  const hasReflection = $derived(
    reflectionStore.getReflectionByDate(moodEntryStore.selectedDate) !== undefined,
  );

  function handleReflection() {
    if (hasReflection) {
      // TODO: Navigate to view/edit reflection page
      console.log('View/edit reflection');
    } else {
      // Navigate to create reflection page
      window.location.href = '/reflection/create';
    }
  }

  function addMoodEntry() {
    window.location.href = '/add';
  }
</script>

<div class="flex h-screen flex-col bg-white">
  <main class="flex flex-1 flex-col justify-between overflow-y-auto px-4 py-2.5">
    <div class="flex w-full flex-col">
      <!-- Date Bar -->
      <div class="flex items-center justify-between px-0 py-2.5">
        <h1 class="text-[28px] leading-9 font-normal text-black">
          {formattedDate}
        </h1>

        <div class="flex items-center gap-1.5">
          <button
            onclick={openDatePicker}
            class="flex h-12 w-[52px] items-center justify-center rounded-full bg-indigo-100 transition-colors hover:bg-indigo-200"
            aria-label="Open date picker"
          >
            <Calendar class="h-6 w-6 text-indigo-900" />
          </button>

          <button
            onclick={previousDay}
            class="flex h-12 w-[52px] items-center justify-center rounded-full bg-indigo-100 transition-colors hover:bg-indigo-200"
            aria-label="Previous day"
          >
            <ChevronLeft class="h-6 w-6 text-indigo-900" />
          </button>

          <button
            onclick={nextDay}
            class="flex h-12 w-[52px] items-center justify-center rounded-full bg-indigo-100 transition-colors hover:bg-indigo-200"
            aria-label="Next day"
          >
            <ChevronRight class="h-6 w-6 text-indigo-900" />
          </button>
        </div>
      </div>

      <!-- Mood Entry Cards -->
      <div class="flex w-full flex-col gap-4">
        {#if moodEntryStore.entries.length === 0}
          <div class="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div class="text-6xl opacity-50">📝</div>
            <div class="flex flex-col gap-2">
              <h2 class="text-xl font-medium text-gray-900">No mood entries yet</h2>
              <p class="text-sm text-gray-600">
                Start tracking your mood by adding your first entry for this day
              </p>
            </div>
          </div>
        {:else}
          {#each moodEntryStore.entries as entry (entry.id)}
            <MoodEntryCard {entry} />
          {/each}
        {/if}
      </div>
    </div>

    <!-- Bottom Buttons -->
    <div class="flex w-full items-end justify-between py-4">
      <button
        onclick={handleReflection}
        class="flex items-center justify-center rounded-full px-6 py-4 transition-colors {hasReflection
          ? 'bg-[#485e92] hover:bg-[#3d4f7a]'
          : 'bg-indigo-100 hover:bg-indigo-200'}"
      >
        <span
          class="text-base font-medium tracking-[0.15px] {hasReflection
            ? 'text-white'
            : 'text-indigo-900'}"
        >
          {hasReflection ? 'Reflection' : 'Start Reflection'}
        </span>
      </button>

      <FloatingActionButton icon={Plus} onclick={addMoodEntry} label="Add mood entry" />
    </div>
  </main>

  <Navigation currentTab="reflections" />

  <DatePicker
    isOpen={isDatePickerOpen}
    selectedDate={moodEntryStore.selectedDate}
    onClose={closeDatePicker}
    onSelectDate={handleDateSelect}
  />
</div>

<script lang="ts">
  import { Calendar, ChevronLeft, ChevronRight, Plus } from '@lucide/svelte';
  import Navigation from '$lib/components/Navigation.svelte';
  import MoodEntryCard from '$lib/components/MoodEntryCard.svelte';
  import { moodEntryStore } from '$lib/stores/moodEntries.svelte';

  const formattedDate = $derived(
    moodEntryStore.selectedDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
  );

  function previousDay() {
    const newDate = new Date(moodEntryStore.selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    moodEntryStore.setDate(newDate);
  }

  function nextDay() {
    const newDate = new Date(moodEntryStore.selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    moodEntryStore.setDate(newDate);
  }

  function openDatePicker() {
    // TODO: Implement date picker modal
    console.log('Open date picker');
  }

  function startReflection() {
    // TODO: Navigate to daily reflection creation page
    console.log('Start reflection');
  }

  function addMoodEntry() {
    // TODO: Navigate to quick add mood entry page
    console.log('Add mood entry');
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
        onclick={startReflection}
        class="flex items-center justify-center rounded-full bg-indigo-100 px-6 py-4 transition-colors hover:bg-indigo-200"
      >
        <span class="text-base font-medium tracking-[0.15px] text-indigo-900">
          Start Reflection
        </span>
      </button>

      <button
        onclick={addMoodEntry}
        class="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-indigo-700 transition-colors hover:bg-indigo-800"
        aria-label="Add mood entry"
      >
        <Plus class="h-6 w-6 text-white" />
      </button>
    </div>
  </main>

  <Navigation currentTab="reflections" />
</div>

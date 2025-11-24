<script lang="ts">
  import { Calendar, ChevronLeft, ChevronRight, Plus } from '@lucide/svelte';
  import { base } from '$app/paths';
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
    const selectedDate = new SvelteDate(date);
    moodEntryStore.setDate(selectedDate);
    reflectionStore.setDate(selectedDate);
    closeDatePicker();
  }

  function addMoodEntry() {
    window.location.href = `${base}/add`;
  }
</script>

<div class="flex h-screen flex-col bg-white">
  <main class="flex flex-1 flex-col overflow-y-auto px-4 py-2.5">
    <div class="flex w-full flex-col gap-5 pt-2.5 pb-24">
      <!-- Header -->
      <div class="flex w-full flex-col gap-2.5">
        <h1 class="text-center text-[22px] leading-7 font-normal text-black">MoodLog</h1>
        <!-- Date selector -->
        <div class="flex w-full items-center justify-between gap-2">
          <button
            onclick={previousDay}
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300"
            aria-label="Previous day"
          >
            <ChevronLeft class="h-6 w-6" />
          </button>

          <button
            onclick={openDatePicker}
            class="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300"
            aria-label="Select date"
          >
            <Calendar class="h-5 w-5" />
            <span class="text-base font-medium">{formattedDate}</span>
          </button>

          <button
            onclick={nextDay}
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300"
            aria-label="Next day"
          >
            <ChevronRight class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Mood Entries List -->
      <div class="flex w-full flex-col gap-3">
        <h2 class="text-base font-medium text-gray-900">Reflections</h2>
        {#if moodEntryStore.filteredEntries.length === 0}
          <div class="flex flex-col items-center gap-3 py-8 text-center">
            <div class="rounded-full bg-gray-100 p-4">
              <Calendar class="h-8 w-8 text-gray-400" />
            </div>
            <div class="flex flex-col gap-1">
              <p class="text-base font-medium text-gray-900">No mood entries yet</p>
              <p class="text-sm text-gray-500">
                Tap the + button to add your first mood entry for today
              </p>
            </div>
          </div>
        {:else}
          {#each moodEntryStore.filteredEntries as entry (entry.id)}
            <MoodEntryCard {entry} />
          {/each}
        {/if}

        <!-- Daily Reflection Section -->
        {#if reflectionStore.dailyReflection}
          {@const reflection = reflectionStore.dailyReflection}
          <div class="mt-6 flex w-full flex-col gap-3">
            <h2 class="text-base font-medium text-gray-900">Daily Reflection</h2>
            <a
              href={`${base}/reflection/${reflection.id}`}
              class="flex w-full cursor-pointer flex-col gap-3 rounded-xl bg-[#f4f3fa] p-4 shadow-md transition-shadow hover:shadow-lg"
            >
              <div class="flex items-center justify-between">
                <h3 class="text-base font-medium text-gray-900">Reflection</h3>
                <span class="text-xs font-medium text-gray-500">
                  {reflection.date.toLocaleDateString('en-GB')}
                </span>
              </div>
              {#if reflection.notes}
                <p class="line-clamp-2 text-sm text-gray-700">{reflection.notes}</p>
              {/if}
            </a>
          </div>
        {:else}
          <div class="mt-6 flex w-full flex-col gap-3">
            <h2 class="text-base font-medium text-gray-900">Daily Reflection</h2>
            <a
              href={`${base}/reflection/create`}
              class="flex w-full cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-colors hover:border-indigo-300 hover:bg-indigo-50"
            >
              <Plus class="h-8 w-8 text-gray-400" />
              <p class="text-sm font-medium text-gray-600">Create today's reflection</p>
            </a>
          </div>
        {/if}
      </div>
    </div>

    <FloatingActionButton icon={Plus} onclick={addMoodEntry} label="Add mood entry" />
  </main>

  <Navigation currentTab="reflections" />
</div>

{#if isDatePickerOpen}
  <DatePicker
    selectedDate={moodEntryStore.selectedDate}
    onClose={closeDatePicker}
    onSelect={handleDateSelect}
  />
{/if}

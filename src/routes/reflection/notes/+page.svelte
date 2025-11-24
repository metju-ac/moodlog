<script lang="ts">
  import { goto } from '$lib/navigation';
  import { onMount } from 'svelte';
  import { Save } from '@lucide/svelte';
  import Navigation from '$lib/components/Navigation.svelte';
  import FloatingActionButton from '$lib/components/FloatingActionButton.svelte';
  import DailyMoodOverview from '$lib/components/DailyMoodOverview.svelte';
  import { reflectionStore } from '$lib/stores/reflections.svelte';

  let notes = $state('');
  let reflectionData = $state<{
    sleepQuality: number;
    physicalActivity: number;
    socialInteractions: number;
    pressure: number;
    date: string;
  } | null>(null);

  onMount(() => {
    const stored = sessionStorage.getItem('reflectionData');
    if (!stored) {
      // If no data, redirect back to create page
      goto('/reflection/create');
      return;
    }

    reflectionData = JSON.parse(stored);
  });

  function handleSave() {
    if (!reflectionData) return;

    const reflection = {
      id: reflectionStore.generateId(),
      date: new Date(reflectionData.date),
      sleepQuality: reflectionData.sleepQuality,
      physicalActivity: reflectionData.physicalActivity,
      socialInteractions: reflectionData.socialInteractions,
      pressure: reflectionData.pressure,
      notes: notes.trim(),
    };

    reflectionStore.addReflection(reflection);

    // Clear session storage
    sessionStorage.removeItem('reflectionData');

    // Navigate back to main page
    goto('/');
  }

  const formattedDate = $derived(
    reflectionData
      ? new Date(reflectionData.date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : '',
  );
</script>

<svelte:head>
  <title>Reflection Notes - MoodLog</title>
</svelte:head>

<div class="flex h-screen flex-col bg-white">
  <main class="flex flex-1 flex-col justify-between overflow-y-auto px-4 py-2.5">
    <div class="flex w-full flex-col gap-5.5 pt-2.5 pb-4">
      <!-- Title -->
      <h1 class="text-center text-[22px] leading-7 font-normal text-black">
        Reflect on your day: {formattedDate}
      </h1>

      {#if reflectionData}
        <DailyMoodOverview date={new Date(reflectionData.date)} />
      {/if}

      <!-- Notes Textarea -->
      <div class="relative w-full">
        <textarea
          bind:value={notes}
          id="reflection-notes"
          placeholder="Write your thoughts about today..."
          rows="8"
          class="w-full resize-none rounded border-[3px] border-indigo-700 px-4 py-3 text-base text-gray-900 transition-colors outline-none focus:border-indigo-800"
        ></textarea>
        <label
          for="reflection-notes"
          class="absolute -top-2.5 left-3 bg-white px-1 text-xs text-indigo-700"
        >
          Notes for this day
        </label>
      </div>
    </div>

    <!-- Save Button -->
    <div class="flex w-full items-center justify-end pb-4">
      <FloatingActionButton icon={Save} onclick={handleSave} label="Save reflection" />
    </div>
  </main>

  <Navigation currentTab="reflections" />
</div>

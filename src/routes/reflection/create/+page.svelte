<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { ChevronRight } from '@lucide/svelte';
  import Navigation from '$lib/components/Navigation.svelte';
  import ReflectionSliders from '$lib/components/ReflectionSliders.svelte';
  import FloatingActionButton from '$lib/components/FloatingActionButton.svelte';
  import { moodEntryStore } from '$lib/stores/moodEntries.svelte';

  // Reactive state for reflection metrics (-100 to 100 for slider, will be converted to -10 to +10)
  let sleepQuality = $state(0);
  let physicalActivity = $state(0);
  let socialInteractions = $state(0);
  let pressure = $state(0);

  // Format date like in Figma: 03-11-2025
  const formattedDate = $derived(
    moodEntryStore.selectedDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
  );

  function handleNext() {
    // Convert -100 to 100 slider values to -10 to +10 for storage
    sessionStorage.setItem(
      'reflectionData',
      JSON.stringify({
        sleepQuality: Math.round(sleepQuality / 10),
        physicalActivity: Math.round(physicalActivity / 10),
        socialInteractions: Math.round(socialInteractions / 10),
        pressure: Math.round(pressure / 10),
        date: moodEntryStore.selectedDate.toISOString(),
      }),
    );
    goto(`${base}/reflection/notes`);
  }
</script>

<svelte:head>
  <title>Reflection - MoodLog</title>
</svelte:head>

<div class="flex h-screen flex-col bg-white">
  <main class="flex flex-1 flex-col overflow-y-auto px-4 py-3">
    <div class="flex w-full flex-col gap-8 px-0 pt-3 pb-24">
      <!-- Title -->
      <h1 class="text-center text-[22px] leading-7 font-normal text-black">
        Reflect on your day: {formattedDate}
      </h1>

      <!-- Sliders -->
      <ReflectionSliders
        {sleepQuality}
        {physicalActivity}
        {socialInteractions}
        {pressure}
        onSleepQualityChange={(val) => (sleepQuality = val)}
        onPhysicalActivityChange={(val) => (physicalActivity = val)}
        onSocialInteractionsChange={(val) => (socialInteractions = val)}
        onPressureChange={(val) => (pressure = val)}
      />
    </div>

    <!-- Next Button -->
    <div class="flex w-full items-center justify-end pb-4">
      <FloatingActionButton icon={ChevronRight} onclick={handleNext} label="Next: Add notes" />
    </div>
  </main>

  <Navigation currentTab="mood-entries" />
</div>

<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { Save, Trash2 } from '@lucide/svelte';
  import Navigation from '$lib/components/Navigation.svelte';
  import ReflectionSliders from '$lib/components/ReflectionSliders.svelte';
  import FloatingActionButton from '$lib/components/FloatingActionButton.svelte';
  import DeleteDialog from '$lib/components/DeleteDialog.svelte';
  import DailyMoodOverview from '$lib/components/DailyMoodOverview.svelte';
  import { reflectionStore } from '$lib/stores/reflections.svelte';
  import type { Reflection } from '$lib/types';

  // Get reflection ID from URL
  const reflectionId = $derived($page.params.id || '');
  let reflection = $state<Reflection | undefined>(undefined);

  // Reactive state for editing
  let notes = $state('');
  let sleepQuality = $state(0); // -100 to 100 for slider
  let physicalActivity = $state(0);
  let socialInteractions = $state(0);
  let pressure = $state(0);

  // Delete dialog state
  let showDeleteDialog = $state(false);

  // Load reflection data
  onMount(() => {
    const foundReflection = reflectionStore.all.find((r) => r.id === reflectionId);
    if (!foundReflection) {
      // If reflection not found, redirect to home
      goto(`${base}/`);
      return;
    }

    reflection = foundReflection;
    notes = foundReflection.notes;
    // Convert -10 to +10 values to -100 to 100 for sliders
    sleepQuality = foundReflection.sleepQuality * 10;
    physicalActivity = foundReflection.physicalActivity * 10;
    socialInteractions = foundReflection.socialInteractions * 10;
    pressure = foundReflection.pressure * 10;
  });

  const formattedDate = $derived(
    reflection
      ? reflection.date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : '',
  );

  function handleSave() {
    if (!reflection) return;

    const updatedReflection: Reflection = {
      ...reflection,
      sleepQuality: Math.round(sleepQuality / 10),
      physicalActivity: Math.round(physicalActivity / 10),
      socialInteractions: Math.round(socialInteractions / 10),
      pressure: Math.round(pressure / 10),
      notes: notes.trim(),
    };

    reflectionStore.updateReflection(reflection.id, updatedReflection);
    goto(`${base}/`);
  }

  function handleDelete() {
    showDeleteDialog = true;
  }

  function confirmDelete() {
    if (!reflection) return;
    reflectionStore.deleteReflection(reflection.id);
    showDeleteDialog = false;
    goto(`${base}/`);
  }

  function cancelDelete() {
    showDeleteDialog = false;
  }
</script>

<svelte:head>
  <title>Edit Reflection - MoodLog</title>
</svelte:head>

<div class="flex h-screen flex-col bg-white">
  <main class="flex flex-1 flex-col overflow-y-auto px-4 py-3">
    <div class="flex w-full flex-col gap-5.5 px-0 pt-3 pb-24">
      <!-- Title -->
      <h1 class="text-center text-[22px] leading-7 font-normal text-black">
        {formattedDate}
      </h1>

      {#if reflection}
        <DailyMoodOverview date={reflection.date} />
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

      <!-- Sliders -->
      <div class="flex w-full flex-col gap-8 py-3">
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
    </div>

    <!-- Floating Action Buttons -->
    <FloatingActionButton
      icon={Trash2}
      onclick={handleDelete}
      label="Delete reflection"
      variant="danger"
      position="left"
    />

    <FloatingActionButton icon={Save} onclick={handleSave} label="Save reflection" />
  </main>

  <Navigation currentTab="mood-entries" />
</div>

<DeleteDialog
  bind:isOpen={showDeleteDialog}
  title="Delete reflection?"
  onConfirm={confirmDelete}
  onCancel={cancelDelete}
/>

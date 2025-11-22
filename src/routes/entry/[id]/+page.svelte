<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { Save, Trash2 } from '@lucide/svelte';
  import Navigation from '$lib/components/Navigation.svelte';
  import MoodSlider from '$lib/components/MoodSlider.svelte';
  import { moodEntryStore } from '$lib/stores/moodEntries.svelte';
  import { labelStore } from '$lib/stores/labels.svelte';
  import { getIconComponent } from '$lib/utils';
  import { SvelteSet } from 'svelte/reactivity';

  // Get entry ID from URL
  const entryId = $derived($page.params.id || '');
  const entry = $derived(moodEntryStore.getEntryById(entryId));

  // If entry not found, redirect to home
  $effect(() => {
    if (!entry || !entryId) {
      goto('/');
    }
  });

  // Initialize state
  let title = $state('');
  let description = $state('');
  let moodValue = $state(0); // -100 to 100 for slider
  let selectedLabels = $state<Set<string>>(new Set());

  // Update state when entry changes
  $effect(() => {
    if (entry) {
      title = entry.title;
      description = entry.description;
      moodValue = entry.moodLevel * 10; // Convert stored -10 to +10 to slider -100 to +100
      selectedLabels = new Set(entry.labels.map((label) => label.id));
    }
  });

  // Convert slider value (-100 to +100) to stored mood level (-10 to +10)
  const moodLevel = $derived(Math.round(moodValue / 10));

  function toggleLabel(labelId: string) {
    const newSet = new SvelteSet(selectedLabels);
    if (newSet.has(labelId)) {
      newSet.delete(labelId);
    } else {
      newSet.add(labelId);
    }
    selectedLabels = newSet;
  }

  function handleSave() {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (!entry) {
      return;
    }

    const selectedLabelObjects = labelStore.all.filter((label) => selectedLabels.has(label.id));

    moodEntryStore.updateEntry(entryId, {
      id: entry.id,
      title: title.trim(),
      description: description.trim(),
      labels: selectedLabelObjects,
      moodLevel: moodLevel,
      date: entry.date, // Keep the original date
    });

    goto('/');
  }

  function handleDelete() {
    if (confirm('Are you sure you want to delete this mood entry? This action cannot be undone.')) {
      moodEntryStore.deleteEntry(entryId);
      goto('/');
    }
  }
</script>

<div class="flex h-screen flex-col bg-white">
  <main class="flex flex-1 flex-col justify-between overflow-y-auto px-4 py-2.5">
    <div class="flex w-full flex-col gap-5 pt-2.5 pb-4">
      <!-- Title -->
      <h1 class="text-center text-[22px] leading-7 font-normal text-black">Edit your mood entry</h1>

      <!-- Title Input -->
      <div class="relative w-full">
        <input
          bind:value={title}
          type="text"
          id="title-input"
          placeholder="Input"
          class="h-14 w-full rounded border-[3px] border-indigo-700 px-4 text-base text-gray-900 transition-colors outline-none focus:border-indigo-800"
        />
        <label
          for="title-input"
          class="absolute -top-2.5 left-3 bg-white px-1 text-xs text-indigo-700"
        >
          Title
        </label>
      </div>

      <!-- Mood Slider -->
      <MoodSlider value={moodValue} onValueChange={(val) => (moodValue = val)} />

      <!-- Context Labels -->
      <div class="flex h-12 w-full flex-wrap items-center gap-1 py-2">
        {#each labelStore.all as label (label.id)}
          {@const IconComponent = getIconComponent(label.icon)}
          <button
            onclick={() => toggleLabel(label.id)}
            class="flex h-8 items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors {selectedLabels.has(
              label.id,
            )
              ? 'border-indigo-700 bg-indigo-50 text-indigo-900'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'}"
          >
            <svelte:component this={IconComponent} class="h-4 w-4" strokeWidth={2} />
            <span>{label.name}</span>
          </button>
        {/each}
      </div>

      <!-- Notes Textarea -->
      <div class="relative w-full">
        <textarea
          bind:value={description}
          id="notes-textarea"
          placeholder="Input"
          rows="12"
          class="w-full resize-none rounded border-[3px] border-indigo-700 px-4 py-3 text-base text-gray-900 transition-colors outline-none focus:border-indigo-800"
        ></textarea>
        <label
          for="notes-textarea"
          class="absolute -top-2.5 left-3 bg-white px-1 text-xs text-indigo-700"
        >
          Notes for this entry
        </label>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex w-full items-center justify-between pb-4">
      <button
        onclick={handleDelete}
        class="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-red-600 transition-colors hover:bg-red-700"
        aria-label="Delete mood entry"
      >
        <Trash2 class="h-6 w-6 text-white" />
      </button>

      <button
        onclick={handleSave}
        class="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-indigo-700 transition-colors hover:bg-indigo-800"
        aria-label="Save mood entry"
      >
        <Save class="h-6 w-6 text-white" />
      </button>
    </div>
  </main>

  <Navigation currentTab="reflections" />
</div>

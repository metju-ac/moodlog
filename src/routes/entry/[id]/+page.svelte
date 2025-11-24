<script lang="ts">
  import { goto } from '$lib/navigation';
  import { page } from '$app/stores';
  import { Save, Trash2 } from '@lucide/svelte';
  import Navigation from '$lib/components/Navigation.svelte';
  import MoodSlider from '$lib/components/MoodSlider.svelte';
  import FloatingActionButton from '$lib/components/FloatingActionButton.svelte';
  import DeleteDialog from '$lib/components/DeleteDialog.svelte';
  import { moodEntryStore } from '$lib/stores/moodEntries.svelte';
  import { labelStore } from '$lib/stores/labels.svelte';
  import { getIconComponent } from '$lib/utils';
  import { SvelteSet } from 'svelte/reactivity';

  // Get entry ID from URL
  const entryId = $derived($page.params.id || '');
  const entry = $derived(moodEntryStore.getEntryById(entryId));

  // Delete dialog state
  let showDeleteDialog = $state(false);

  // If entry not found, redirect to home
  $effect(() => {
    if (!entry || !entryId) {
      goto('/');
    }
  });

  // Initialize state
  let title = $state('');
  let description = $state('');
  let moodValue = $state(0);
  let selectedLabels = $state<Set<string>>(new Set());

  // Update state when entry changes
  $effect(() => {
    if (entry) {
      title = entry.title;
      description = entry.description;
      moodValue = entry.moodLevel * 10;
      selectedLabels = new Set(entry.labels.map((label) => label.id));
    }
  });

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
      date: entry.date,
    });

    goto('/');
  }

  function handleDelete() {
    showDeleteDialog = true;
  }

  function confirmDelete() {
    moodEntryStore.deleteEntry(entryId);
    showDeleteDialog = false;
    goto('/');
  }

  function cancelDelete() {
    showDeleteDialog = false;
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
        class="flex h-14 w-[72px] items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-red-700 active:scale-95"
        aria-label="Delete mood entry"
      >
        <Trash2 class="h-6 w-6" strokeWidth={2} />
      </button>

      <FloatingActionButton icon={Save} onclick={handleSave} label="Save mood entry" />
    </div>
  </main>

  <Navigation currentTab="reflections" />
</div>

<DeleteDialog
  bind:isOpen={showDeleteDialog}
  title="Delete mood entry?"
  onConfirm={confirmDelete}
  onCancel={cancelDelete}
/>

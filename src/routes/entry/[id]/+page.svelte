<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import { Save, Trash2, Edit, X } from '@lucide/svelte';
  import Navigation from '$lib/components/Navigation.svelte';
  import MoodSlider from '$lib/components/MoodSlider.svelte';
  import FloatingActionButton from '$lib/components/FloatingActionButton.svelte';
  import DeleteDialog from '$lib/components/DeleteDialog.svelte';
  import { moodEntryStore } from '$lib/stores/moodEntries.svelte';
  import { labelStore } from '$lib/stores/labels.svelte';
  import { showToast } from '$lib/components/Toast.svelte';
  import { getIconComponent } from '$lib/utils';
  import { SvelteSet } from 'svelte/reactivity';

  // Get entry ID from URL
  const entryId = $derived($page.params.id || '');
  const entry = $derived(moodEntryStore.getEntryById(entryId));

  // Delete dialog state
  let showDeleteDialog = $state(false);

  // Edit mode state
  let isEditMode = $state(false);

  // If entry not found, redirect to home
  $effect(() => {
    if (!entry || !entryId) {
      goto(`${base}/`);
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

  function handleEdit() {
    isEditMode = true;
  }

  function handleCancel() {
    if (!entry) return;
    // Reset all values to original entry data
    title = entry.title;
    description = entry.description;
    moodValue = entry.moodLevel * 10;
    selectedLabels = new Set(entry.labels.map((label) => label.id));
    isEditMode = false;
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

    showToast('Mood entry updated', 'success');
    isEditMode = false;
    goto(`${base}/`);
  }

  function handleDelete() {
    showDeleteDialog = true;
  }

  function confirmDelete() {
    moodEntryStore.deleteEntry(entryId);
    showDeleteDialog = false;
    showToast('Mood entry deleted', 'success');
    goto(`${base}/`);
  }

  function cancelDelete() {
    showDeleteDialog = false;
  }
</script>

<svelte:head>
  <title>Edit Mood Entry - MoodLog</title>
</svelte:head>

<div class="flex h-screen flex-col bg-white">
  <main class="flex flex-1 flex-col overflow-y-auto px-4 py-2.5">
    <div class="flex w-full flex-col gap-5 pt-2.5 pb-24">
      <!-- Title -->
      <h1 class="text-center text-[22px] leading-7 font-normal text-black">
        {isEditMode ? 'Edit your mood entry' : 'View your mood entry'}
      </h1>

      <!-- Title Input -->
      <div class="relative w-full">
        <input
          bind:value={title}
          type="text"
          id="title-input"
          placeholder="Input"
          disabled={!isEditMode}
          class="h-14 w-full rounded border-[3px] border-indigo-700 px-4 text-base text-gray-900 transition-colors outline-none focus:border-indigo-800 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-700"
        />
        <label
          for="title-input"
          class="absolute -top-2.5 left-3 bg-white px-1 text-xs text-indigo-700"
        >
          Title
        </label>
      </div>

      <!-- Mood Section -->
      <div class="flex flex-col gap-2">
        <p class="text-sm font-medium text-black">How are you feeling?</p>
        <MoodSlider
          value={moodValue}
          onValueChange={(val) => (moodValue = val)}
          labels={['Negative', 'Neutral', 'Positive']}
          disabled={!isEditMode}
        />
      </div>

      <!-- Context Section -->
      <div class="flex flex-col gap-2">
        <p class="text-sm font-medium text-black">What's the context?</p>
        <!-- Context Labels -->
        <div class="flex w-full flex-wrap items-center gap-1 py-2">
          {#each labelStore.all as label (label.id)}
            {@const IconComponent = getIconComponent(label.icon)}
            <button
              onclick={() => toggleLabel(label.id)}
              disabled={!isEditMode}
              class="flex h-8 items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed {selectedLabels.has(
                label.id,
              )
                ? 'border-indigo-700 bg-indigo-50 text-indigo-900'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'}"
            >
              <IconComponent class="h-4 w-4" strokeWidth={2} />
              <span>{label.name}</span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Notes Textarea -->
      <div class="relative w-full">
        <textarea
          bind:value={description}
          id="notes-textarea"
          placeholder="Input"
          rows="12"
          disabled={!isEditMode}
          class="w-full resize-none rounded border-[3px] border-indigo-700 px-4 py-3 text-base text-gray-900 transition-colors outline-none focus:border-indigo-800 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-700"
        ></textarea>
        <label
          for="notes-textarea"
          class="absolute -top-2.5 left-3 bg-white px-1 text-xs text-indigo-700"
        >
          Notes for this entry
        </label>
      </div>
    </div>

    <!-- Floating Action Buttons -->
    {#if isEditMode}
      <FloatingActionButton
        icon={X}
        onclick={handleCancel}
        label="Cancel editing"
        variant="secondary"
        position="left"
      />

      <FloatingActionButton icon={Save} onclick={handleSave} label="Save mood entry" />
    {:else}
      <FloatingActionButton
        icon={Trash2}
        onclick={handleDelete}
        label="Delete mood entry"
        variant="danger"
        position="left"
      />

      <FloatingActionButton icon={Edit} onclick={handleEdit} label="Edit mood entry" />
    {/if}
  </main>

  <Navigation currentTab="mood-entries" />
</div>

<DeleteDialog
  bind:isOpen={showDeleteDialog}
  title="Delete mood entry?"
  onConfirm={confirmDelete}
  onCancel={cancelDelete}
/>

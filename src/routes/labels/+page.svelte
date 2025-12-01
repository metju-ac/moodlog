<script lang="ts">
  import { Plus, X } from '@lucide/svelte';
  import Navigation from '$lib/components/Navigation.svelte';
  import LabelCard from '$lib/components/LabelCard.svelte';
  import FloatingActionButton from '$lib/components/FloatingActionButton.svelte';
  import DeleteDialog from '$lib/components/DeleteDialog.svelte';
  import { labelStore } from '$lib/stores/labels.svelte';
  import type { Label } from '$lib/types';
  import { getIconComponent } from '$lib/utils';

  // Dialog state
  let showDialog = $state(false);
  let editingLabel = $state<Label | null>(null);
  let labelName = $state('');
  let selectedIcon = $state('graduation-cap');

  // Delete dialog state
  let showDeleteDialog = $state(false);
  let deletingLabelId = $state<string | null>(null);

  const availableIcons = [
    { name: 'graduation-cap', label: 'School' },
    { name: 'briefcase', label: 'Work' },
    { name: 'puzzle', label: 'Free time' },
    { name: 'trophy', label: 'Sport' },
    { name: 'heart', label: 'Love' },
    { name: 'home', label: 'Home' },
    { name: 'users', label: 'Friends' },
    { name: 'music', label: 'Music' },
    { name: 'book', label: 'Reading' },
    { name: 'dumbbell', label: 'Gym' },
    { name: 'coffee', label: 'Relax' },
    { name: 'plane', label: 'Travel' },
    { name: 'star', label: 'Achievement' },
    { name: 'sun', label: 'Outdoor' },
    { name: 'moon', label: 'Sleep' },
    { name: 'utensils', label: 'Food' },
    { name: 'gamepad', label: 'Gaming' },
    { name: 'camera', label: 'Photos' },
  ];

  function openCreateDialog() {
    editingLabel = null;
    labelName = '';
    selectedIcon = 'graduation-cap';
    showDialog = true;
  }

  function openEditDialog(label: Label) {
    editingLabel = label;
    labelName = label.name;
    selectedIcon = label.icon;
    showDialog = true;
  }

  function closeDialog() {
    showDialog = false;
    editingLabel = null;
    labelName = '';
    selectedIcon = 'graduation-cap';
  }

  function saveLabel() {
    if (!labelName.trim()) return;

    if (editingLabel) {
      labelStore.updateLabel(editingLabel.id, {
        name: labelName.trim(),
        icon: selectedIcon,
      });
    } else {
      labelStore.addLabel({
        id: labelStore.generateId(),
        name: labelName.trim(),
        icon: selectedIcon,
      });
    }

    closeDialog();
  }

  function deleteLabel(labelId: string) {
    deletingLabelId = labelId;
    showDeleteDialog = true;
  }

  function confirmDelete() {
    if (deletingLabelId) {
      labelStore.deleteLabel(deletingLabelId);
      deletingLabelId = null;
    }
    showDeleteDialog = false;
  }

  function cancelDelete() {
    deletingLabelId = null;
    showDeleteDialog = false;
  }
</script>

<svelte:head>
  <title>Labels - MoodLog</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-white">
  <!-- Main Content -->
  <main class="flex flex-1 flex-col items-end justify-between px-4 py-3 pb-6">
    <!-- Label Cards -->
    <div class="flex w-full flex-col gap-4 py-3">
      {#each labelStore.all as label (label.id)}
        <LabelCard {label} onEdit={openEditDialog} onDelete={deleteLabel} />
      {/each}
    </div>

    <!-- Floating Action Button -->
    <FloatingActionButton icon={Plus} onclick={openCreateDialog} label="Add new label" />
  </main>

  <!-- Navigation -->
  <Navigation currentTab="labels" />
</div>

<!-- Dialog/Modal -->
{#if showDialog}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    onclick={(e) => {
      if (e.target === e.currentTarget) closeDialog();
    }}
    onkeydown={(e) => {
      if (e.key === 'Escape') closeDialog();
    }}
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialog-title"
    tabindex="-1"
  >
    <div class="mx-4 w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
      <!-- Dialog Header -->
      <div class="mb-6 flex items-center justify-between">
        <h2 id="dialog-title" class="text-2xl font-medium text-[#1d1b20]">
          {editingLabel ? 'Edit Label' : 'New Label'}
        </h2>
        <button
          type="button"
          onclick={closeDialog}
          class="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
          aria-label="Close dialog"
        >
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Label Name Input -->
      <div class="mb-6">
        <label for="label-name" class="mb-2 block text-sm font-medium text-[#44464f]">
          Label name
        </label>
        <input
          id="label-name"
          type="text"
          bind:value={labelName}
          placeholder="Enter label name"
          class="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-[#485e92] focus:ring-2 focus:ring-[#485e92]/20 focus:outline-none"
        />
      </div>

      <!-- Icon Selection -->
      <div class="mb-8 max-h-[400px] overflow-y-auto">
        <p class="mb-3 block text-sm font-medium text-[#44464f]">Select icon</p>
        <div class="grid grid-cols-4 gap-3">
          {#each availableIcons as iconOption (iconOption.name)}
            {@const IconComponent = getIconComponent(iconOption.name)}
            <button
              type="button"
              onclick={() => (selectedIcon = iconOption.name)}
              class="flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all {selectedIcon ===
              iconOption.name
                ? 'border-[#485e92] bg-[#d9dff6]'
                : 'border-gray-200 hover:border-gray-300'}"
              aria-label="Select {iconOption.label} icon"
            >
              <IconComponent
                class="h-8 w-8 {selectedIcon === iconOption.name
                  ? 'text-[#485e92]'
                  : 'text-gray-600'}"
                strokeWidth={1.5}
              />
              <span class="text-center text-xs text-gray-600">{iconOption.label}</span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3">
        <button
          type="button"
          onclick={closeDialog}
          class="flex-1 rounded-full border border-[#485e92] px-6 py-3 text-base font-medium text-[#485e92] transition-colors hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onclick={saveLabel}
          disabled={!labelName.trim()}
          class="flex-1 rounded-full bg-[#485e92] px-6 py-3 text-base font-medium text-white transition-colors hover:bg-[#3d4f7a] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {editingLabel ? 'Save' : 'Create'}
        </button>
      </div>
    </div>
  </div>
{/if}

<DeleteDialog
  bind:isOpen={showDeleteDialog}
  title="Delete label?"
  onConfirm={confirmDelete}
  onCancel={cancelDelete}
/>

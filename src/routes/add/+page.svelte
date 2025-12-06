<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { Save } from '@lucide/svelte';
  import Navigation from '$lib/components/Navigation.svelte';
  import MoodSlider from '$lib/components/MoodSlider.svelte';
  import FloatingActionButton from '$lib/components/FloatingActionButton.svelte';
  import { moodEntryStore } from '$lib/stores/moodEntries.svelte';
  import { labelStore } from '$lib/stores/labels.svelte';
  import { showToast } from '$lib/components/Toast.svelte';
  import { getIconComponent } from '$lib/utils';
  import { SvelteDate, SvelteSet } from 'svelte/reactivity';

  let title = $state('');
  let description = $state('');
  let moodValue = $state(0); // -100 to 100 for slider
  let selectedLabels = $state<Set<string>>(new Set());

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

    const selectedLabelObjects = labelStore.all.filter((label) => selectedLabels.has(label.id));

    // Combine selected date with current time
    const entryDate = new SvelteDate(moodEntryStore.selectedDate);
    const now = new Date();
    entryDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

    moodEntryStore.addEntry({
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      labels: selectedLabelObjects,
      moodLevel: moodLevel,
      date: entryDate,
    });

    showToast('Mood entry created', 'success');
    goto(`${base}/`);
  }
</script>

<div class="flex h-screen flex-col bg-white">
  <main class="flex flex-1 flex-col overflow-y-auto px-4 py-2.5">
    <div class="flex w-full flex-col gap-5 pt-2.5 pb-24">
      <!-- Title -->
      <h1 class="text-center text-[22px] leading-7 font-normal text-black">
        Quick entry about your feelings
      </h1>

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

      <!-- Mood Section -->
      <div class="flex flex-col gap-2">
        <p class="text-sm font-medium text-black">How are you feeling?</p>
        <MoodSlider
          value={moodValue}
          onValueChange={(val) => (moodValue = val)}
          labels={['Negative', 'Neutral', 'Positive']}
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
              class="flex h-8 items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors {selectedLabels.has(
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

    <!-- Save Button -->
    <div class="flex w-full items-center justify-end pb-4">
      <FloatingActionButton icon={Save} onclick={handleSave} label="Save mood entry" />
    </div>
  </main>

  <Navigation currentTab="mood-entries" />
</div>

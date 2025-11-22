<script lang="ts">
  import { Trash2 } from '@lucide/svelte';

  type Props = {
    isOpen: boolean;
    title: string;
    description?: string;
    onConfirm: () => void;
    onCancel: () => void;
  };

  let {
    isOpen = $bindable(),
    title,
    description = 'This action cannot be undone. Are you sure you want to remove this entry?',
    onConfirm,
    onCancel,
  }: Props = $props();

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onCancel();
    }
  }
</script>

{#if isOpen}
  <!-- Backdrop -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    onclick={handleBackdropClick}
    onkeydown={handleKeyDown}
    tabindex="-1"
  >
    <!-- Dialog -->
    <div
      class="w-full max-w-md rounded-[28px] bg-[#e8e7ef]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <!-- Text Content -->
      <div class="flex flex-col px-6 pt-6 pb-0">
        <!-- Title -->
        <h2
          id="dialog-title"
          class="mb-4 text-2xl leading-8 font-normal text-[#1a1b21]"
          style="font-variation-settings: 'wdth' 100"
        >
          {title}
        </h2>

        <!-- Description -->
        <p
          class="text-sm leading-5 tracking-[0.25px] text-[#44464f]"
          style="font-variation-settings: 'wdth' 100"
        >
          {description}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-2 px-6 pt-5 pb-5">
        <!-- Cancel Button -->
        <button
          type="button"
          onclick={onCancel}
          class="rounded-full px-4 py-2.5 text-sm leading-5 font-medium tracking-[0.1px] text-[#485e92] transition-colors hover:bg-[#485e92]/10"
          style="font-variation-settings: 'wdth' 100"
        >
          Cancel
        </button>

        <!-- Delete Button -->
        <button
          type="button"
          onclick={onConfirm}
          class="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm leading-5 font-medium tracking-[0.1px] text-[#914b43] transition-colors hover:bg-[#914b43]/10"
          style="font-variation-settings: 'wdth' 100"
        >
          <Trash2 class="h-5 w-5" />
          Delete
        </button>
      </div>
    </div>
  </div>
{/if}

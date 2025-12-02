<script lang="ts">
  import { Pencil, Trash2 } from '@lucide/svelte';
  import { getIconComponent } from '$lib/utils';
  import type { Label } from '$lib/types';

  type Props = {
    label: Label;
    onEdit: (label: Label) => void;
    onDelete: (labelId: string) => void;
  };

  let { label, onEdit, onDelete }: Props = $props();

  const IconComponent = $derived(getIconComponent(label.icon));
</script>

<div
  class="flex w-full items-center overflow-clip rounded-xl bg-[#f4f3fa] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)]"
>
  <!-- Content -->
  <div class="flex flex-1 items-center gap-4 p-4">
    <!-- Icon -->
    <div class="flex h-10 w-10 shrink-0 items-center justify-center overflow-clip rounded-lg">
      <IconComponent class="h-10 w-10 text-[#485e92]" strokeWidth={1.5} />
    </div>

    <!-- Text -->
    <div class="flex flex-1 flex-col gap-1">
      <p class="text-base leading-6 font-medium tracking-[0.15px] text-[#1a1b21]">
        {label.name}
      </p>
    </div>
  </div>

  <!-- Actions -->
  <div class="flex h-full items-center gap-3 px-3 py-4">
    <button
      type="button"
      onclick={() => onEdit(label)}
      class="flex h-10 items-center gap-1.5 rounded-full bg-[#d9dff6] px-3 text-[#485e92] transition-all hover:bg-[#c5cbe8] active:scale-95"
      aria-label="Edit {label.name}"
    >
      <Pencil class="h-4 w-4" strokeWidth={2} />
      <span class="text-sm font-medium">Edit</span>
    </button>
    <button
      type="button"
      onclick={() => onDelete(label.id)}
      class="flex h-10 items-center gap-1.5 rounded-full bg-rose-100 px-3 text-rose-600 transition-all hover:bg-rose-200 active:scale-95"
      aria-label="Delete {label.name}"
    >
      <Trash2 class="h-4 w-4" strokeWidth={2} />
      <span class="text-sm font-medium">Delete</span>
    </button>
  </div>
</div>

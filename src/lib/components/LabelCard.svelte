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
  <div class="flex h-full items-center justify-between px-2 py-6">
    <button
      type="button"
      onclick={() => onEdit(label)}
      class="flex h-6 w-6 items-center justify-center text-[#1d1b20] transition-opacity hover:opacity-70"
      aria-label="Edit {label.name}"
    >
      <Pencil class="h-6 w-6" />
    </button>
    <button
      type="button"
      onclick={() => onDelete(label.id)}
      class="flex h-6 w-6 items-center justify-center text-[#1d1b20] transition-opacity hover:opacity-70"
      aria-label="Delete {label.name}"
    >
      <Trash2 class="h-6 w-6" />
    </button>
  </div>
</div>

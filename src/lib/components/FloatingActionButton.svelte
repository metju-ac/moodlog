<script lang="ts">
  import type { Icon } from '@lucide/svelte';

  type Props = {
    icon: typeof Icon;
    onclick: () => void;
    label: string;
    variant?: 'primary' | 'success';
  };

  let { icon, onclick, label, variant = 'primary' }: Props = $props();

  const IconComponent = icon;

  const variantClasses = $derived(
    variant === 'success' ? 'bg-[#485e92] hover:bg-[#3d4f7a]' : 'bg-[#485e92] hover:bg-[#3d4f7a]',
  );
</script>

<button
  type="button"
  {onclick}
  class="flex h-14 w-[72px] items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 active:scale-95 {variantClasses}"
  aria-label={label}
>
  <svelte:component this={IconComponent} class="h-6 w-6" strokeWidth={2} />
</button>

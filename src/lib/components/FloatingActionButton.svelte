<script lang="ts">
  import type { Icon } from '@lucide/svelte';

  type Props = {
    onclick: () => void;
    label: string;
    icon?: typeof Icon;
    text?: string;
    variant?: 'primary' | 'danger' | 'secondary';
    position?: 'left' | 'right';
  };

  let {
    onclick,
    label,
    icon: IconComponent,
    text,
    variant = 'primary',
    position = 'right',
  }: Props = $props();

  const variantClasses = $derived(
    variant === 'danger'
      ? 'bg-[#914b43] hover:bg-[#9e372c]'
      : variant === 'secondary'
        ? 'bg-[#6b7280] hover:bg-[#4b5563]'
        : 'bg-[#485e92] hover:bg-[#3d4f7a]',
  );

  const positionClasses = $derived(position === 'left' ? 'left-6' : 'right-6');
</script>

<button
  type="button"
  {onclick}
  class="fixed bottom-20 z-50 flex h-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 active:scale-95 {variantClasses} {positionClasses} {text
    ? 'px-6'
    : 'w-[72px]'}"
  aria-label={label}
>
  {#if IconComponent}
    <IconComponent class="h-6 w-6" strokeWidth={2} />
  {/if}
  {#if text}
    <span class="text-base font-medium tracking-[0.15px]">{text}</span>
  {/if}
</button>

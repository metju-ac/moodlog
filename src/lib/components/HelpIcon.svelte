<script lang="ts">
  import { base } from '$app/paths';
  import { CircleHelp } from '@lucide/svelte';

  type Props = {
    size?: 'sm' | 'md';
  };

  let { size = 'md' }: Props = $props();

  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
  };
</script>

<a
  href="{base}/about"
  class="flex items-center justify-center text-gray-400 transition-colors hover:text-indigo-600"
  aria-label="Help - Learn about this page"
>
  <CircleHelp class={sizeClasses[size]} />
</a>

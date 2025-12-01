<script lang="ts" module>
  export type ToastType = 'success' | 'error' | 'info';

  type Toast = {
    id: string;
    message: string;
    type: ToastType;
  };

  let toasts = $state<Toast[]>([]);

  export function showToast(message: string, type: ToastType = 'success') {
    const id = Date.now().toString();
    toasts = [...toasts, { id, message, type }];

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      dismissToast(id);
    }, 3000);
  }

  function dismissToast(id: string) {
    toasts = toasts.filter((t) => t.id !== id);
  }
</script>

<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { Check, X, Info } from '@lucide/svelte';

  const iconMap = {
    success: Check,
    error: X,
    info: Info,
  };

  const colorMap = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };
</script>

<div
  class="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4"
>
  {#each toasts as toast (toast.id)}
    {@const Icon = iconMap[toast.type]}
    <div
      class="pointer-events-auto flex items-center gap-3 rounded-lg bg-gray-900 px-4 py-3 text-white shadow-lg"
      in:fly={{ y: -20, duration: 200 }}
      out:fade={{ duration: 150 }}
    >
      <div class="flex h-6 w-6 items-center justify-center rounded-full {colorMap[toast.type]}">
        <Icon class="h-4 w-4" strokeWidth={2.5} />
      </div>
      <span class="text-sm font-medium">{toast.message}</span>
      <button
        onclick={() => dismissToast(toast.id)}
        class="ml-2 flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-white/20"
        aria-label="Dismiss notification"
      >
        <X class="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  {/each}
</div>

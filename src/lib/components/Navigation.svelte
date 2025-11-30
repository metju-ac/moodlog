<script lang="ts">
  import { base } from '$app/paths';
  import { LineChart, Edit3, Tag } from '@lucide/svelte';
  import type { NavigationTab } from '$lib/types';

  type Props = {
    currentTab?: NavigationTab;
  };

  let { currentTab = 'mood-entries' }: Props = $props();

  const tabs = [
    { id: 'insights' as const, label: 'Insights', icon: LineChart, href: `${base}/insights` },
    { id: 'mood-entries' as const, label: 'Mood entries', icon: Edit3, href: `${base}/` },
    { id: 'labels' as const, label: 'Labels', icon: Tag, href: `${base}/labels` },
  ];
</script>

<nav
  class="sticky bottom-0 z-50 flex w-full items-center border-t border-gray-200 bg-gray-100"
  style="padding-bottom: max(env(safe-area-inset-bottom, 0), 0.5rem);"
>
  {#each tabs as tab (tab.id)}
    {@const Icon = tab.icon}
    <a
      href={tab.href}
      class="flex flex-1 cursor-pointer flex-col items-center gap-1 py-1.5"
      aria-current={currentTab === tab.id ? 'page' : undefined}
    >
      <div
        class="flex h-8 w-14 items-center justify-center rounded-2xl {currentTab === tab.id
          ? 'bg-indigo-100'
          : ''}"
      >
        <Icon class="h-6 w-6 {currentTab === tab.id ? 'text-indigo-700' : 'text-gray-600'}" />
      </div>
      <span
        class="text-xs font-medium tracking-[0.5px] {currentTab === tab.id
          ? 'text-indigo-700'
          : 'text-gray-600'}"
      >
        {tab.label}
      </span>
    </a>
  {/each}
</nav>

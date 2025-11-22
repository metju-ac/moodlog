<script lang="ts">
  import { LineChart, Edit3, Tag } from '@lucide/svelte';
  import type { NavigationTab } from '$lib/types';

  type Props = {
    currentTab?: NavigationTab;
  };

  let { currentTab = 'reflections' }: Props = $props();

  const tabs = [
    { id: 'insights' as const, label: 'Insights', icon: LineChart, href: '/insights' },
    { id: 'reflections' as const, label: 'Reflections', icon: Edit3, href: '/' },
    { id: 'labels' as const, label: 'Labels', icon: Tag, href: '/labels' },
  ];
</script>

<nav class="flex w-full items-center bg-gray-100">
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

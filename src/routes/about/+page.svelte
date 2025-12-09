<script lang="ts">
  import { base } from '$app/paths';
  import { ArrowLeft, Zap, BookOpen, LineChart } from '@lucide/svelte';
  import Navigation from '$lib/components/Navigation.svelte';
</script>

<svelte:head>
  <title>About - MoodLog</title>
</svelte:head>

<div class="flex h-screen flex-col bg-white">
  <!-- Header -->
  <div class="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
    <div class="flex items-center gap-3">
      <a
        href="{base}/"
        class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 transition-colors hover:bg-indigo-200"
        aria-label="Back to entries"
      >
        <ArrowLeft class="h-5 w-5 text-indigo-900" />
      </a>
      <h1 class="text-xl font-medium text-black">About MoodLog</h1>
    </div>
  </div>

  <main class="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6 pb-24">
    <!-- App Introduction -->
    <div class="flex flex-col gap-3">
      <p class="text-base leading-relaxed text-gray-700">
        MoodLog is a simple and intuitive mood tracking app designed to help you understand your
        emotional patterns and improve your well-being.
      </p>
    </div>

    <!-- Quick Entry Section -->
    <div class="flex flex-col gap-3 rounded-xl bg-indigo-50 p-4">
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700"
        >
          <Zap class="h-5 w-5" />
        </div>
        <h2 class="text-lg font-medium text-indigo-900">Quick Entry</h2>
      </div>
      <p class="text-sm leading-relaxed text-gray-700">
        Capture your mood in seconds with quick entries. Simply describe what happened, rate how
        you're feeling on a scale from negative to positive, add context labels, and optionally
        include any additional thoughts. Quick entries help you track emotional moments throughout
        your day without disrupting your flow.
      </p>
    </div>

    <!-- Reflection Section -->
    <div class="flex flex-col gap-3 rounded-xl bg-amber-50 p-4">
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700"
        >
          <BookOpen class="h-5 w-5" />
        </div>
        <h2 class="text-lg font-medium text-amber-900">Daily Reflection</h2>
      </div>
      <p class="text-sm leading-relaxed text-gray-700">
        End each day with a reflection. Rate your sleep quality, physical activity, social
        interactions, and stress/pressure levels. Add notes about your day to capture important
        context. Daily reflections help you identify patterns between lifestyle factors and your
        mood over time.
      </p>
    </div>

    <!-- Insights Section -->
    <div class="flex flex-col gap-3 rounded-xl bg-emerald-50 p-4">
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
        >
          <LineChart class="h-5 w-5" />
        </div>
        <h2 class="text-lg font-medium text-emerald-900">Insights</h2>
      </div>
      <p class="text-sm leading-relaxed text-gray-700">
        View your mood patterns over time with interactive charts and statistics. Filter by time
        range (week, month, 3 months, or year) and by labels to discover what activities or
        situations affect your mood. Track your average mood, entry frequency, and see how
        reflection metrics correlate with your emotional state.
      </p>
    </div>

    <!-- Tips Section -->
    <div class="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <h2 class="text-lg font-medium text-gray-900">Tips for Better Tracking</h2>
      <ul class="flex flex-col gap-2 text-sm leading-relaxed text-gray-700">
        <li class="flex gap-2">
          <span class="text-indigo-600">•</span>
          <span>Log entries as close to the moment as possible for accuracy</span>
        </li>
        <li class="flex gap-2">
          <span class="text-indigo-600">•</span>
          <span>Use labels consistently to enable meaningful filtering</span>
        </li>
        <li class="flex gap-2">
          <span class="text-indigo-600">•</span>
          <span>Complete daily reflections before bed to build a habit</span>
        </li>
        <li class="flex gap-2">
          <span class="text-indigo-600">•</span>
          <span>Review insights weekly to spot patterns</span>
        </li>
      </ul>
    </div>
  </main>

  <Navigation currentTab="mood-entries" />
</div>

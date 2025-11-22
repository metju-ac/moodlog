<script lang="ts">
  type Props = {
    value: number; // -100 to 100
    onValueChange: (value: number) => void;
    leftLabel?: string;
    rightLabel?: string;
    snapToCenter?: boolean; // Whether to snap to center (neutral zone)
  };

  let {
    value = 0,
    onValueChange,
    leftLabel = 'Negative',
    rightLabel = 'Positive',
    snapToCenter = true,
  }: Props = $props();

  let isDragging = $state(false);
  let sliderRef: HTMLDivElement;

  // Convert -100 to 100 value to 0-100 percentage
  const percentage = $derived((value + 100) / 2);

  function handleMouseDown(event: MouseEvent) {
    isDragging = true;
    updateValue(event.clientX);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  function handleMouseMove(event: MouseEvent) {
    if (isDragging) {
      updateValue(event.clientX);
    }
  }

  function handleMouseUp() {
    isDragging = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }

  function handleTouchStart(event: TouchEvent) {
    isDragging = true;
    updateValue(event.touches[0].clientX);
  }

  function handleTouchMove(event: TouchEvent) {
    if (isDragging) {
      updateValue(event.touches[0].clientX);
    }
  }

  function handleTouchEnd() {
    isDragging = false;
  }

  function updateValue(clientX: number) {
    if (!sliderRef) return;

    const rect = sliderRef.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const newPercentage = (x / rect.width) * 100;
    const newValue = newPercentage * 2 - 100;

    onValueChange(Math.round(newValue));
  }

  // Snap to neutral zone (-10 to 10)
  function snapToCenterValue(val: number): number {
    if (val >= -10 && val <= 10) {
      return 0;
    }
    return val;
  }

  $effect(() => {
    if (snapToCenter && !isDragging) {
      const snapped = snapToCenterValue(value);
      if (snapped !== value) {
        onValueChange(snapped);
      }
    }
  });
</script>

<div class="flex w-full flex-col gap-2">
  <!-- Labels -->
  <div class="flex items-center justify-between px-2.5 text-xs font-medium text-black">
    <span>{leftLabel}</span>
    <span>{rightLabel}</span>
  </div>

  <!-- Slider Track -->
  <div
    bind:this={sliderRef}
    class="relative h-14 w-full cursor-pointer touch-none"
    role="slider"
    tabindex="0"
    aria-valuemin="-100"
    aria-valuemax="100"
    aria-valuenow={value}
    onmousedown={handleMouseDown}
    ontouchstart={handleTouchStart}
    ontouchmove={handleTouchMove}
    ontouchend={handleTouchEnd}
  >
    <!-- Background track (inactive) -->
    <div class="absolute top-1/2 right-0 left-0 h-14 -translate-y-1/2 overflow-hidden rounded-2xl">
      <!-- Left side (negative) -->
      <div
        class="absolute top-0 left-0 h-full rounded-l-2xl bg-indigo-100"
        style="width: {percentage}%"
      ></div>
      <!-- Right side (positive) -->
      <div
        class="absolute top-0 right-0 h-full rounded-r-2xl bg-indigo-100"
        style="width: {100 - percentage}%"
      ></div>
      <!-- Active track -->
      <div
        class="absolute top-0 h-full bg-[#485e92]"
        style="left: 50%; width: {Math.abs(percentage - 50)}%; transform: translateX({value < 0
          ? '-100%'
          : '0'})"
      ></div>
    </div>

    <!-- Handle -->
    <div
      class="absolute top-1/2 h-[68px] w-1 -translate-y-1/2 rounded-sm bg-[#485e92] shadow-[0_0_0_2px_white] transition-shadow {isDragging
        ? 'shadow-[0_0_0_2px_white,0_4px_6px_-1px_rgba(0,0,0,0.1)]'
        : ''}"
      style="left: {percentage}%"
    ></div>

    <!-- Stop indicators -->
    <div
      class="pointer-events-none absolute top-1/2 left-3 h-1 w-1 -translate-y-1/2 rounded-full bg-indigo-900"
    ></div>
    <div
      class="pointer-events-none absolute top-1/2 right-3 h-1 w-1 -translate-y-1/2 rounded-full bg-indigo-900"
    ></div>
  </div>
</div>

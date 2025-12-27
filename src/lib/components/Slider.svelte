<script lang="ts">
  type Props = {
    value: number; // -100 to 100
    onValueChange: (value: number) => void;
    labels: string[]; // Array of label texts to distribute evenly
    snapToCenter?: boolean; // Whether to snap to center (neutral zone)
    color?: string; // Color for the slider (default indigo)
    disabled?: boolean; // Whether the slider is disabled
  };

  let {
    value = 0,
    onValueChange,
    labels,
    snapToCenter = true,
    color = '#485e92',
    disabled = false,
  }: Props = $props();

  // Calculate evenly distributed positions for labels
  const labelPositions = $derived(
    labels.map((text, index) => {
      const position =
        index === 0
          ? -100
          : index === labels.length - 1
            ? 100
            : -100 + (200 / (labels.length - 1)) * index;
      return { text, position };
    }),
  );

  let isDragging = $state(false);
  let sliderRef: HTMLDivElement;

  // Convert -100 to 100 value to 0-100 percentage
  const percentage = $derived((value + 100) / 2);

  function handleMouseDown(event: MouseEvent) {
    if (disabled) return;
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
    if (disabled) return;
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

  function snapToCenterValue(val: number): number {
    if (val >= -5 && val <= 5) {
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
  <div class="relative w-full px-2.5 text-xs font-medium text-black" style="height: 20px;">
    {#each labelPositions as label (label.position)}
      {@const labelPercentage = (label.position + 100) / 2}
      {@const isLeftEdge = label.position === -100}
      {@const isRightEdge = label.position === 100}
      {@const translateClass = isLeftEdge
        ? ''
        : isRightEdge
          ? '-translate-x-full'
          : '-translate-x-1/2'}
      <span class="absolute whitespace-nowrap {translateClass}" style="left: {labelPercentage}%">
        {label.text}
      </span>
    {/each}
  </div>

  <!-- Slider Track -->
  <div
    bind:this={sliderRef}
    class="relative h-14 w-full touch-none {disabled
      ? 'cursor-not-allowed opacity-60'
      : 'cursor-pointer'}"
    role="slider"
    tabindex={disabled ? -1 : 0}
    aria-valuemin="-100"
    aria-valuemax="100"
    aria-valuenow={value}
    aria-disabled={disabled}
    onmousedown={handleMouseDown}
    ontouchstart={handleTouchStart}
    ontouchmove={handleTouchMove}
    ontouchend={handleTouchEnd}
  >
    <!-- Background track (inactive) -->
    <div class="absolute top-1/2 right-0 left-0 h-14 -translate-y-1/2 overflow-hidden rounded-2xl">
      <!-- Left side (negative) -->
      <div
        class="absolute top-0 left-0 h-full rounded-l-2xl bg-gray-200"
        style="width: {percentage}%"
      ></div>
      <!-- Right side (positive) -->
      <div
        class="absolute top-0 right-0 h-full rounded-r-2xl bg-gray-200"
        style="width: {100 - percentage}%"
      ></div>
      <!-- Active track -->
      <div
        class="absolute top-0 h-full"
        style="left: 50%; width: {Math.abs(percentage - 50)}%; transform: translateX({value < 0
          ? '-100%'
          : '0'}); background-color: {color}"
      ></div>
    </div>

    <!-- Handle -->
    <div
      class="absolute top-1/2 h-[68px] w-1 -translate-y-1/2 rounded-sm shadow-[0_0_0_2px_white] transition-shadow {isDragging
        ? 'shadow-[0_0_0_2px_white,0_4px_6px_-1px_rgba(0,0,0,0.1)]'
        : ''}"
      style="left: {percentage}%; background-color: {color}"
    ></div>

    <!-- Current Value -->
    <span
      class="absolute top-15 z-10 -translate-x-1/2 rounded-sm bg-white/80 px-1 text-xs font-bold backdrop-blur-[2px]"
      style="left: {percentage}%; color: {color}"
    >
      {value}
    </span>
  </div>
</div>

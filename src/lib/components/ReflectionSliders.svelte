<script lang="ts">
  import Slider from './Slider.svelte';

  type Props = {
    sleepQuality: number;
    physicalActivity: number;
    socialInteractions: number;
    stress: number;
    disabled?: boolean;
    onSleepQualityChange: (value: number) => void;
    onPhysicalActivityChange: (value: number) => void;
    onSocialInteractionsChange: (value: number) => void;
    onStressChange: (value: number) => void;
  };

  let {
    sleepQuality,
    physicalActivity,
    socialInteractions,
    stress,
    disabled = false,
    onSleepQualityChange,
    onPhysicalActivityChange,
    onSocialInteractionsChange,
    onStressChange,
  }: Props = $props();
</script>

<div class="flex w-full flex-col gap-8">
  <!-- Sleep Quality -->
  <div class="flex flex-col gap-1">
    <p class="text-sm font-medium text-black">How was your sleep?</p>
    <Slider
      value={sleepQuality}
      onValueChange={onSleepQualityChange}
      labels={['Very poor', 'Excellent']}
      snapToCenter={false}
      {disabled}
    />
  </div>

  <!-- Physical Activity -->
  <div class="flex flex-col gap-1">
    <p class="text-sm font-medium text-black">How physically active were you?</p>
    <Slider
      value={physicalActivity}
      onValueChange={onPhysicalActivityChange}
      labels={['Sedentary', 'Intense']}
      snapToCenter={false}
      {disabled}
    />
  </div>

  <!-- Social Interactions -->
  <div class="flex flex-col gap-1">
    <p class="text-sm font-medium text-black">How were your social interactions?</p>
    <Slider
      value={socialInteractions}
      onValueChange={onSocialInteractionsChange}
      labels={['Draining', 'Energizing']}
      snapToCenter={false}
      {disabled}
    />
  </div>

  <!-- Stress -->
  <div class="flex flex-col gap-1">
    <p class="text-sm font-medium text-black">Work/School stress level?</p>
    <Slider
      value={stress}
      onValueChange={onStressChange}
      labels={['None', 'Overwhelming']}
      snapToCenter={false}
      {disabled}
    />
  </div>
</div>

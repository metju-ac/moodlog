<script lang="ts">
  import Slider from './Slider.svelte';

  type Props = {
    sleepQuality: number;
    physicalActivity: number;
    socialInteractions: number;
    pressure: number;
    onSleepQualityChange: (value: number) => void;
    onPhysicalActivityChange: (value: number) => void;
    onSocialInteractionsChange: (value: number) => void;
    onPressureChange: (value: number) => void;
  };

  let {
    sleepQuality,
    physicalActivity,
    socialInteractions,
    pressure,
    onSleepQualityChange,
    onPhysicalActivityChange,
    onSocialInteractionsChange,
    onPressureChange,
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
    />
  </div>

  <!-- Pressure -->
  <div class="flex flex-col gap-1">
    <p class="text-sm font-medium text-black">Work/School pressure level?</p>
    <Slider
      value={pressure}
      onValueChange={onPressureChange}
      labels={['None', 'Overwhelming']}
      snapToCenter={false}
    />
  </div>
</div>

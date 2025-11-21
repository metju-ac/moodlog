<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';

  let firstInput = $state('');
  let secondInput = $state('');

  function handleSubmit() {
    console.log('First input:', firstInput);
    console.log('Second input:', secondInput);
  }
</script>

<div class="container mx-auto max-w-md p-8">
  <h1 class="mb-6 text-3xl font-bold">MoodLog</h1>

  <form onsubmit={handleSubmit} class="space-y-4">
    <div class="space-y-2">
      <label for="first-input" class="text-sm font-medium">First Input</label>
      <Input id="first-input" bind:value={firstInput} placeholder="Enter first value" />
    </div>

    <div class="space-y-2">
      <label for="second-input" class="text-sm font-medium">Second Input</label>
      <Input id="second-input" bind:value={secondInput} placeholder="Enter second value" />
    </div>

    <Button type="submit" class="w-full">Submit</Button>
  </form>
</div>

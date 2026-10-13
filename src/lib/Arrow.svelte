<script lang="ts">
  let {
    direction = "up-right",
  }: { direction?: "up-right" | "down" | "down-right" | "up" } = $props();
  const angles = { "up-right": 0, "down-right": 90, down: 135, up: -45 };
</script>

<svg
  class="arrow-icon"
  style:transform={`rotate(${angles[direction]}deg)`}
  width="15"
  height="15"
  viewBox="0 0 24 24"
  fill="none"
  aria-hidden="true"
  ><path
    d="M5 19 19 5M5 5h14v14"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  /></svg
>

<script lang="ts">
  import Arrow from "./Arrow.svelte";
  import type { Component } from "svelte";
  let Playable = $state<Component<{ onclose: () => void }> | null>(null);
  let loading = $state(false);
  let error = $state(false);
  async function launch() {
    if (error) {
      window.location.reload();
      return;
    }
    loading = true;
    error = false;
    try {
      Playable = (await import("../lab/Playable.svelte")).default;
    } catch {
      error = true;
    } finally {
      loading = false;
    }
  }
</script>

{#if Playable}
  <Playable
    onclose={() => {
      Playable = null;
    }}
  />
{:else}
  <div class="lab-preview">
    <div class="lab-preview-copy">
      <span class="eyebrow"
        ><span class="tiny-dot"></span> EXPERIMENT 001 / REINFORCEMENT LEARNING</span
      >
      <h3>Reward-design playground</h3>
      <p>
        Adjust the rewards in a navigation task, train an agent, and observe
        its learned policy.
      </p>
      <button class="button primary" onclick={launch} disabled={loading}
        >{loading
          ? "Loading experiment…"
          : error
            ? "Reload to retry"
            : "Enter the playground"}
        <Arrow /></button
      >
      {#if error}<p role="alert">
          The experiment could not load. You can retry or keep exploring the
          site.
        </p>{/if}
      <span class="lab-note">Personal experiment · Runs in your browser</span>
    </div>
    <div class="preview-map" aria-hidden="true">
      <div class="map-caption">
        <span>REWARD LANDSCAPE</span><span>ILLUSTRATION</span>
      </div>
      <svg viewBox="0 0 380 300" fill="none">
        <defs
          ><pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
            ><path
              d="M40 0H0v40"
              stroke="#626262"
              stroke-opacity=".5"
            /></pattern
          ></defs
        >
        <rect x="30" y="30" width="320" height="240" fill="url(#grid)" />
        <path
          d="M50 250V170H170V90H330V50"
          stroke="#00b8c8"
          stroke-width="2"
          stroke-dasharray="4 6"
        />
        {#each [0, 1, 2, 3, 4, 5, 6, 7] as col}
          {#each [0, 1, 2, 3, 4, 5] as row}
            <circle
              cx={50 + col * 40}
              cy={50 + row * 40}
              r="3"
              fill="#a1a1a1"
            />
          {/each}
        {/each}
        <circle cx="50" cy="250" r="13" fill="#00b8c8" /><circle
          cx="50"
          cy="250"
          r="5"
          fill="#303030"
        />
        <path d="M330 37l13 13-13 13-13-13z" fill="#f072c6" />
        <rect
          x="198"
          y="118"
          width="24"
          height="24"
          rx="3"
          fill="#c0008b"
        /><path
          d="M205 125l10 10m0-10l-10 10"
          stroke="#fff"
          stroke-width="1.5"
        />
        <rect
          x="238"
          y="158"
          width="24"
          height="24"
          rx="3"
          fill="#c0008b"
        /><path
          d="M245 165l10 10m0-10l-10 10"
          stroke="#fff"
          stroke-width="1.5"
        />
      </svg>
      <div class="map-legend">
        <span><i class="cyan-dot"></i> Agent</span><span
          ><i class="pink-dot"></i> Incentives</span
        >
      </div>
    </div>
  </div>
{/if}

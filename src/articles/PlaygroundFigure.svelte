<script lang="ts">
  import type { Component } from "svelte";

  let launched = $state(false);
  let loading = $state(false);
  let launchError = $state("");
  let Player: Component<{ onclose: () => void }> | null = $state(null);

  /**
   * The launcher gate keeps the experiment (worker download included) out of
   * the network until explicitly activated. Closing returns to this gate, so
   * a relaunch starts a fresh session with the same controls.
   */
  async function activate() {
    if (loading || Player) return;
    loading = true;
    launchError = "";
    try {
      const module = await import("../lab/Playable.svelte");
      Player = module.default as Component<{ onclose: () => void }>;
      launched = true;
    } catch {
      launchError =
        "The experiment could not be downloaded. Check the connection and retry.";
    } finally {
      loading = false;
    }
  }

  function close() {
    launched = false;
    Player = null;
  }
</script>

{#if launched && Player}
  <Player onclose={close} />
{:else}
  <div class="launch-gate">
    <div>
      <span class="eyebrow">INTERACTIVE FIGURE / RUNS IN YOUR BROWSER</span>
      <h3>The reward playground</h3>
      <p>
        A tabular learning agent trains entirely on your device. Adjust its
        incentives, run short bounded training batches, then watch the policy
        it learned. The experiment downloads only once you launch it.
      </p>
    </div>
    <div class="launch-actions">
      <button class="button primary" onclick={activate} disabled={loading}>
        {loading ? "Preparing experiment…" : "Launch experiment"}
      </button>
      {#if launchError}
        <p role="alert">{launchError}</p>
      {/if}
    </div>
  </div>
{/if}

<style>
  .launch-gate {
    display: grid;
    gap: 1.25rem;
    border: 1px dashed var(--border);
    background: var(--panel);
    padding: 1.25rem 1.25rem 1.4rem;
    border-radius: 6px;
  }
  .launch-gate h3 {
    margin: 0.35rem 0 0.4rem;
    font-size: 1.15rem;
    line-height: 1.3;
    color: var(--text);
  }
  .launch-gate p {
    margin: 0;
    max-width: 46rem;
    line-height: 1.6;
    color: var(--muted);
  }
  .launch-actions {
    display: grid;
    gap: 0.5rem;
  }
  .launch-actions p {
    color: var(--pink-text);
  }
  @media (min-width: 900px) {
    .launch-gate {
      grid-template-columns: 1fr auto;
      align-items: end;
    }
    .launch-actions {
      justify-self: end;
      min-width: 13rem;
    }
    .launch-actions .button {
      width: 100%;
    }
  }
</style>

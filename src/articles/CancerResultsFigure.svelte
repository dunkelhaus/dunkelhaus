<script lang="ts">
  type Partition = { confusion: [[number, number], [number, number]]; auroc: number };
  type Experiment = {
    id: string;
    description: string;
    unit: string;
    limitation?: string;
    development: Partition;
    final: Partition;
  };
  let experiments = $state<Experiment[]>([]);
  let selected = $state("M5");
  let partition = $state<"development" | "final">("development");
  let loading = $state(false);
  let error = $state("");
  const experiment = $derived(experiments.find((item) => item.id === selected));
  const result = $derived(experiment?.[partition]);
  const total = $derived(result?.confusion.flat().reduce((sum, count) => sum + count, 0) ?? 0);
  const classes = ["Lung adenocarcinoma", "Melanoma"];

  async function loadResults() {
    loading = true;
    error = "";
    try {
      const response = await fetch(new URL("../../articles/cancer-classification-results.json", window.location.href));
      if (!response.ok) throw new Error("Results unavailable");
      const data = await response.json();
      if (data.schema_version !== 1 || data.experiments?.length !== 8) throw new Error("Unsupported result bundle");
      experiments = data.experiments;
    } catch {
      error = "The saved results could not load. Retry, or use the tables and download link in the article.";
    } finally {
      loading = false;
    }
  }

  function percent(value: number) {
    return `${(100 * value).toFixed(2)}%`;
  }
</script>

<div>
  {#if !experiments.length}
    <p>This figure displays saved, real-data measurements. It does not train a model or download tumor records.</p>
    <button class="button primary" onclick={loadResults} disabled={loading}>
      {loading ? "Loading measurements…" : "Explore measured results"}
    </button>
    {#if error}<p role="alert">{error}</p>{/if}
  {:else if experiment && result}
    <div class="figure-controls">
      <label>
        Experiment
        <select bind:value={selected}>
          {#each experiments as item}<option value={item.id}>{item.id}</option>{/each}
        </select>
      </label>
      <label>
        Evaluation partition
        <select bind:value={partition}>
          <option value="development">Development (pooled OOF)</option>
          <option value="final">Final test</option>
        </select>
      </label>
    </div>
    <div aria-live="polite" aria-atomic="true">
      <p><strong>{experiment.id}: {experiment.description}.</strong> Prediction unit: {experiment.unit}.</p>
      {#if experiment.limitation}<p><strong>{experiment.limitation}</strong></p>{/if}
      <p>
        {total.toLocaleString("en-US")} predictions;
        accuracy {percent((result.confusion[0][0] + result.confusion[1][1]) / total)};
        AUROC {result.auroc.toFixed(4)}.
      </p>
      <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard focus is needed to scroll an overflowing table.) -->
      <div class="table-scroll" role="region" aria-label="Confusion counts" tabindex="0">
      <table>
        <caption>Confusion counts: rows are true classes; columns are predictions.</caption>
        <thead><tr><th scope="col">True class</th><th scope="col">Predicted lung</th><th scope="col">Predicted melanoma</th></tr></thead>
        <tbody>
          {#each classes as name, index}
            <tr><th scope="row">{name}</th><td>{result.confusion[index][0].toLocaleString("en-US")}</td><td>{result.confusion[index][1].toLocaleString("en-US")}</td></tr>
          {/each}
        </tbody>
      </table>
      </div>
      <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard focus is needed to scroll an overflowing table.) -->
      <div class="table-scroll" role="region" aria-label="Class metrics" tabindex="0">
      <table>
        <caption>Class metrics at probability threshold 0.5.</caption>
        <thead><tr><th scope="col">Class</th><th scope="col">Precision</th><th scope="col">Recall</th><th scope="col">Support</th></tr></thead>
        <tbody>
          {#each classes as name, index}
            {@const correct = result.confusion[index][index]}
            {@const predicted = result.confusion[0][index] + result.confusion[1][index]}
            {@const support = result.confusion[index][0] + result.confusion[index][1]}
            <tr><th scope="row">{name}</th><td>{predicted ? percent(correct / predicted) : "0% (undefined)"}</td><td>{support ? percent(correct / support) : "Undefined"}</td><td>{support.toLocaleString("en-US")}</td></tr>
          {/each}
        </tbody>
      </table>
      </div>
      <p>Melanoma is the positive class. AUROC uses saved probabilities; it is not derived from the confusion counts. Development OOF predictions are not training-set scores.</p>
    </div>
  {/if}
</div>

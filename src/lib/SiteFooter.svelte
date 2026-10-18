<script lang="ts">
  import Arrow from "./Arrow.svelte";
  import { links } from "./content";

  interface SiteFooterProps {
    brandHref: string;
    /** Back-to-top target on the current page, e.g. #home or #main. */
    backHref: string;
  }

  let { brandHref, backHref }: SiteFooterProps = $props();
</script>

<footer class="section-wrap">
  <div>
    <a class="wordmark" href={brandHref}
      >Suraj Jena<span class="wordmark-period">.</span></a
    >
  </div>
  <nav aria-label="Social links">
    <a href={links.github}>GitHub <Arrow /></a><a href={links.linkedin}
      >LinkedIn <Arrow /></a
    ><a href={links.email}>Email <Arrow /></a>
  </nav>
  <a class="back-top" href={backHref} aria-label="Back to top"
    ><Arrow direction="up" /></a
  >
</footer>

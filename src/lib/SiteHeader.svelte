<script lang="ts">
  import Arrow from "./Arrow.svelte";
  import { links } from "./content";

  interface SiteHeaderProps {
    /** Where the wordmark points, relative to the current page depth. */
    brandHref: string;
    experienceHref: string;
    labHref: string;
    aboutHref: string;
    /** Marks the Lab link as the current page when on lab pages. */
    labIsCurrent?: boolean;
  }

  let {
    brandHref,
    experienceHref,
    labHref,
    aboutHref,
    labIsCurrent = false,
  }: SiteHeaderProps = $props();
</script>

<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <a class="wordmark" href={brandHref} aria-label="Suraj Jena home"
    ><span class="brand-symbol" aria-hidden="true"><i></i><i></i></span> Suraj
    Jena<span class="wordmark-period">.</span></a
  >
  <nav aria-label="Main navigation">
    <a href={experienceHref}>Experience</a><a
      href={labHref}
      aria-current={labIsCurrent ? "page" : undefined}
      >Lab <span class="nav-dot" aria-hidden="true"></span></a
    ><a href={aboutHref}>About</a>
  </nav>
  <a class="header-contact" href={links.email}>Contact <Arrow /></a>
</header>

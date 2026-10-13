<script lang="ts">
  import Arrow from "./lib/Arrow.svelte";
  import Molecules from "./lib/Molecules.svelte";
  import LabShell from "./lib/LabShell.svelte";
  import { experience, links } from "./lib/content";
</script>

<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <a class="wordmark" href="#home" aria-label="Suraj Jena home"
    ><span class="brand-symbol" aria-hidden="true"><i></i><i></i></span> Suraj
    Jena<span class="wordmark-period">.</span></a
  >
  <nav aria-label="Main navigation">
    <a href="#experience">Experience</a><a href="#lab"
      >Lab <span class="nav-dot" aria-hidden="true"></span></a
    ><a href="#about">About</a>
  </nav>
  <a class="header-contact" href={links.email}>Contact <Arrow /></a>
</header>

<main id="main">
  <section class="hero section-wrap" id="home" aria-labelledby="hero-title">
    <div class="hero-copy">
      <div class="eyebrow hero-eyebrow">
        <span class="tiny-dot"></span> SOFTWARE ENGINEER / AUSTIN, TX
      </div>
      <h1 id="hero-title">
        Software engineer.<br />
        <span class="cyan-text">Machine learning.</span>
      </h1>
      <p class="hero-description">
        I’m Suraj, a software engineer in Austin. My work spans machine learning,
        event-driven systems, and engineering tools.
      </p>
      <div class="hero-actions">
        <a class="button primary" href="#experience"
          >Explore my work <Arrow direction="down-right" /></a
        ><a
          class="text-link"
          href={`${import.meta.env.BASE_URL}suraj-jena-resume.pdf`}
          download>Download résumé <Arrow direction="down" /></a
        >
      </div>
    </div>
    <div class="hero-art">
      <Molecules />
      <div class="art-caption">
        <span>CYAN / MAGENTA</span><span>FIG. 01</span>
      </div>
    </div>
    <div class="hero-bottom">
      <a href="#experience"
        >SCROLL TO EXPLORE <Arrow direction="down" /></a
      >
    </div>
  </section>

  <section
    class="experience section-wrap"
    id="experience"
    aria-labelledby="experience-title"
  >
    <div class="section-heading">
      <div>
        <span class="eyebrow">01 / SELECTED EXPERIENCE</span>
        <h2 id="experience-title">Selected experience</h2>
      </div>
      <p>
        Machine learning and software engineering at Comcast and Wells Fargo.
      </p>
    </div>
    <div class="experience-list">
      {#each experience as item}
        <article class="experience-row">
          <div class="experience-meta">
            <span class="row-number">{item.number}</span>
            <strong class="company-name">
              {#if item.logo}
                <img class="company-logo" src={`${import.meta.env.BASE_URL}companies/${item.logo}`} width="32" height="32" alt="" loading="lazy" />
              {/if}
              <span>{item.company}</span>
            </strong>
            <span class="experience-period">{item.period}</span>
          </div>
          <div class="experience-body">
            <span class="role">{item.role}</span>
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
            <details>
              <summary
                >More about the work <span aria-hidden="true">+</span></summary
              >
              <p>{item.detail}</p>
            </details>
            <ul class="tags" aria-label="Areas of work">
              {#each item.tags as tag}<li>{tag}</li>{/each}
            </ul>
          </div>
        </article>
      {/each}
    </div>
  </section>

  <section class="lab section-wrap" id="lab" aria-labelledby="lab-title">
    <div class="section-heading">
      <div>
        <span class="eyebrow">02 / THE LAB</span>
        <h2 id="lab-title">ML lab</h2>
      </div>
      <p>
        Interactive experiments in machine learning.
      </p>
    </div>
    <LabShell />
  </section>

  <section class="about section-wrap" id="about" aria-labelledby="about-title">
    <div class="about-label">
      <span class="eyebrow">03 / ABOUT</span>
      <div class="about-symbol" aria-hidden="true">
        <span></span><span></span>
      </div>
    </div>
    <div class="about-copy">
      <h2 id="about-title">About me</h2>
      <p>
        I’m a software engineer based in Austin, with a computer science
        background from UC Davis. My work connects machine learning, distributed
        systems, and the people building them.
      </p>
      <p>
        Outside that work, I’m drawn to music with texture and contrast—from
        electronic and heavy rock to quieter songwriting and cinematic scores.
        I use this site to share projects and experiments.
      </p>
      <a class="text-link" href={links.email}
        >Email me <Arrow /></a
      >
    </div>
  </section>
</main>

<footer class="section-wrap">
  <div>
    <a class="wordmark" href="#home"
      >Suraj Jena<span class="wordmark-period">.</span></a
    >
  </div>
  <nav aria-label="Social links">
    <a href={links.github}>GitHub <Arrow /></a><a href={links.linkedin}
      >LinkedIn <Arrow /></a
    ><a href={links.email}>Email <Arrow /></a>
  </nav>
  <a class="back-top" href="#home" aria-label="Back to top"
    ><Arrow direction="up" /></a
  >
</footer>

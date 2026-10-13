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
  <a class="header-contact" href={links.email}>Let’s talk <Arrow /></a>
</header>

<main id="main">
  <section class="hero section-wrap" id="home" aria-labelledby="hero-title">
    <div class="hero-copy">
      <div class="eyebrow hero-eyebrow">
        <span class="tiny-dot"></span> SOFTWARE ENGINEER / AUSTIN, TX
      </div>
      <h1 id="hero-title">
        Building systems.<br />Exploring
        <span class="cyan-text">intelligence.</span>
      </h1>
      <p class="hero-description">
        I’m Suraj. I work at the intersection of software and machine learning,
        turning complex ideas into useful, thoughtful systems.
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
        <span>STRUCTURE × POSSIBILITY</span><span>FIG. 01</span>
      </div>
    </div>
    <div class="hero-bottom">
      <span>Software. Learning. A little curiosity.</span><a href="#experience"
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
        <h2 id="experience-title">Ideas into impact.</h2>
      </div>
      <p>
        From understanding language to connecting homes—work grounded in real
        systems.
      </p>
    </div>
    <div class="experience-list">
      {#each experience as item}
        <article class="experience-row">
          <div class="experience-meta">
            <span class="row-number">{item.number}</span><strong
              >{item.company}</strong
            ><span>{item.period}</span>
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
        <h2 id="lab-title">Less theory. More trying.</h2>
      </div>
      <p>
        A place to make ideas tangible.<br />Start with a little reinforcement
        learning.
      </p>
    </div>
    <LabShell />
  </section>

  <section class="about section-wrap" id="about" aria-labelledby="about-title">
    <div class="about-label">
      <span class="eyebrow">03 / A LITTLE ABOUT ME</span>
      <div class="about-symbol" aria-hidden="true">
        <span></span><span></span>
      </div>
    </div>
    <div class="about-copy">
      <h2 id="about-title">Curiosity is the<br />common thread.</h2>
      <p>
        I’m a software engineer based in Austin, with a computer science
        background from UC Davis. My work connects machine learning, distributed
        systems, and the people building them.
      </p>
      <p>
        Outside that work, I’m drawn to music with texture and contrast—from
        electronic and heavy rock to quieter songwriting and cinematic scores.
        This site is a small space for that same curiosity: building,
        experimenting, and sharing what I learn.
      </p>
      <a class="text-link" href={links.email}
        >Have something in mind? Let’s talk. <Arrow /></a
      >
    </div>
  </section>
</main>

<footer class="section-wrap">
  <div>
    <a class="wordmark" href="#home"
      >Suraj Jena<span class="wordmark-period">.</span></a
    ><span class="footer-note">Built with intention. Always exploring.</span>
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

<script lang="ts">
  import SiteHeader from "./SiteHeader.svelte";
  import SiteFooter from "./SiteFooter.svelte";
  import { articles } from "./articles";

  interface ArticleMeta {
    title: string;
    href: string;
    description: string;
    datetime: string;
    displayDate: string;
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  const entries: ArticleMeta[] = articles.map((article) => ({
    title: article.title,
    href: `./${article.slug}/`,
    description: article.description,
    datetime: article.published,
    displayDate: formatter.format(new Date(article.published)),
  }));
</script>

<SiteHeader
  brandHref="../"
  experienceHref="../#experience"
  labHref="./"
  aboutHref="../#about"
  labIsCurrent
/>

<main id="main">
  <section class="lab-index section-wrap" aria-labelledby="lab-index-title">
    <div class="section-heading">
      <div>
        <span class="eyebrow">THE LAB</span>
        <h1 id="lab-index-title">Lab</h1>
      </div>
      <p>
        Long-form writing with hands-on machine learning experiments inside the
        article.
      </p>
    </div>
    <ol class="article-list">
      {#each entries as entry (entry.href)}
        <li class="article-entry">
          <p class="article-date">
            <time datetime={entry.datetime}>{entry.displayDate}</time>
          </p>
          <h2 class="article-title"><a href={entry.href}>{entry.title}</a></h2>
          <p class="article-description">{entry.description}</p>
          <a class="article-read text-link" href={entry.href}
            >Read the article</a
          >
        </li>
      {/each}
    </ol>
  </section>
</main>

<SiteFooter brandHref="../" backHref="#main" />

<style>
  .article-list {
    list-style: none;
    margin: 0;
    padding: 0;
    max-width: 720px;
  }
  .article-entry {
    border-top: 1px solid var(--border);
    padding: 2.25rem 0;
    display: grid;
    grid-template-columns: 10rem 1fr;
    gap: 0.5rem 1.5rem;
    align-items: baseline;
  }
  .article-date {
    margin: 0;
    color: var(--muted);
    font-size: 0.85rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .article-title {
    margin: 0;
    font-size: 1.35rem;
    line-height: 1.25;
  }
  .article-title a {
    display: block;
    padding: 0.55rem 0;
    margin: -0.55rem 0;
  }
  .article-title a:hover,
  .article-title a:focus-visible {
    color: var(--cyan-text);
  }
  .article-description {
    grid-column: 2;
    margin: 0.25rem 0 0;
    color: var(--muted);
    line-height: 1.6;
  }
  .article-read {
    grid-column: 2;
    justify-self: start;
    display: inline-block;
    padding: 0.7rem 0;
    margin: -0.7rem 0;
  }
  @media (max-width: 700px) {
    .article-entry {
      grid-template-columns: 1fr;
      padding: 1.75rem 0;
    }
    .article-description,
    .article-read {
      grid-column: 1;
    }
  }
</style>

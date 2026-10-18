export interface Article {
  /** URL slug and build directory name, served at lab/<slug>/. */
  slug: string;
  title: string;
  /** Publication date as an ISO calendar date, e.g. 2026-10-18. */
  published: string;
  description: string;
}

export const articles: readonly Article[] = [
  {
    slug: "reward-design",
    title: "Designing rewards for a small learning agent",
    published: "2026-10-18",
    description:
      "How a tabular Q-learning agent turns reward settings into behavior, with a live 48-cell environment you can retrain yourself.",
  },
];

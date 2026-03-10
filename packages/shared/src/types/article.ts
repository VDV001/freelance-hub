export interface Article {
  /** SHA-256 hash of the URL — used for deduplication */
  id: string;
  title: string;
  description: string;
  url: string;
  /** Habr hub name (e.g. "golang", "typescript") */
  hub: string;
  /** Author username */
  author: string;
  /** Parsed tags/categories from RSS */
  tags: string[];
  /** ISO timestamp */
  createdAt: string;
  /** ISO timestamp when we first saw this article */
  fetchedAt: string;
}

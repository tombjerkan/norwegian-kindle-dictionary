import fs from "fs/promises";
import path from "path";

import { rateLimit, ensureDirectoriesExist } from "./utils.ts";

const ARTICLES_DIRECTORY = path.join(".", "data", "articles");

const fetchArticle = rateLimit(async (articleId: string) => {
  console.log(`Fetching article "${articleId}"`);

  const response = await fetch(`https://ord.uib.no/bm/article/${articleId}.json`);

  if (!response.ok) {
    throw new Error(`Could not article ${articleId}`);
  }

  return await response.json();
});

const articleIds = process.argv.slice(2);

await ensureDirectoriesExist(ARTICLES_DIRECTORY);

for (const articleId of articleIds) {
  const article = await fetchArticle(articleId);

  await fs.writeFile(
    path.join(ARTICLES_DIRECTORY, `${articleId}.json`),
    JSON.stringify(article, null, 2),
  );
}

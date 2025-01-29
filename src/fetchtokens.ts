import fs from "fs/promises";
import path from "path";
import { z } from "zod";

import { rateLimit, ensureDirectoriesExist } from "./utils.ts";

const TOKENS_FILE = path.join(".", "data", "tokens.json");

const tokenArticlesSchema = z.object({
  articles: z.object({
    bm: z.array(z.number()),
  }),
});

const fetchArticlesByToken = rateLimit(async (token: string) => {
  console.log(`Fetching articles for "${token}"`);

  const response = await fetch(`https://ord.uib.no/api/articles?w=${token}&dict=bm&scope=ei`);

  if (!response.ok) {
    throw new Error(`Could not fetch articles for token "${token}"`);
  }

  const responseJson = await response.json();

  return tokenArticlesSchema.parse(responseJson).articles.bm;
});

const tokens = process.argv.slice(2);

const tokensWithArticles = await Promise.all(
  tokens.map(async (token) => ({
    token,
    articleIds: await fetchArticlesByToken(token),
  })),
);

await ensureDirectoriesExist(path.dirname(TOKENS_FILE));
await fs.writeFile(TOKENS_FILE, JSON.stringify(tokensWithArticles, null, 2));

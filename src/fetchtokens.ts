import fs from "fs/promises";
import path from "path";
import { z } from "zod";

const TOKENS_FILE = path.join(".", "data", "tokens", "tokens.json");

const tokenArticlesSchema = z.object({
  articles: z.object({
    bm: z.array(z.number()),
  }),
});

// Limit the number of times an async requests to 1 per second so we don't overload the API
const rateLimit = <T extends Array<unknown>, U>(fn: (...args: T) => Promise<U>) => {
  let lastCalledMs = 0;

  return async (...args: T): Promise<U> => {
    while (Date.now() - lastCalledMs < 1000) {
      await new Promise((resolve) => setTimeout(resolve, 1000 - (Date.now() - lastCalledMs)));
    }

    lastCalledMs = Date.now();

    return fn(...args);
  };
};

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

const directory = path.dirname(TOKENS_FILE);
try {
  await fs.access(directory, fs.constants.F_OK);
} catch {
  await fs.mkdir(directory, { recursive: true });
}

await fs.writeFile(TOKENS_FILE, JSON.stringify(tokensWithArticles, null, 2));
